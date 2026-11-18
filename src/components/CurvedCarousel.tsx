import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/* Kıvrık mercekten görülen fotoğraf karuseli (tek WebGL tuvali).
   Ortadaki kart düz okunur; merkezden uzaklaştıkça kartlar uzar, bükülür ve kenarda hafif renk
   ayrışması olur. SELF'S QR uyarlaması:
   - kendi kendine yavaşça döner, sayfa kaydırıldıkça hızlanır, sonsuz döngü
   - sürüklenir / fırlatılır, ok tuşları ve düğmelerle gezilir; bırakınca yaya oturur
   - bir karta tıklamak o menüyü yeni sekmede açar
   Uzak görseller WebGL için CORS izni ister (Pexels CDN verir). */

export type LensSlide = {
  title: string;
  kicker?: string;
  caption?: string;
  image: string;
  href?: string;
};

type Props = {
  slides: LensSlide[];
  label?: ReactNode;
  hint?: ReactNode;
  /** Dış kartların bükülme miktarı; 0 düz */
  bend?: number;
  /** Kendi kendine dönme hızı (kart/sn) */
  speed?: number;
  height?: string;
  className?: string;
};

// #region hareket
export const wrap = (i: number, n: number) => (n > 0 ? ((i % n) + n) % n : 0);
/** i. kartın konuma göre işaretli uzaklığı (döngüde kısa yoldan) */
export const offsetOf = (i: number, pos: number, n: number) => (n <= 0 ? 0 : wrap(i - pos + n / 2, n) - n / 2);
/** Fırlatmanın duracağı en yakın tam kart */
export const restFor = (pos: number, v: number, max = 3) => Math.round(pos + Math.max(-max, Math.min(max, v * 0.18)));
/** Kritik sönümlü yayın bir adımı */
export function springStep(pos: number, vel: number, target: number, dt: number, omega = 11): [number, number] {
  const a = (target - pos) * omega * omega - vel * 2 * omega;
  const v = vel + a * dt;
  return [pos + v * dt, v];
}
/** Sahne boyutuna göre dikey kart ölçüsü */
export function cardSize(w: number, h: number): [number, number] {
  const cw = Math.min(w < 640 ? w * 0.56 : w * 0.22, h * 0.36);
  return [Math.round(cw), Math.round(cw * 1.25)];
}
const pad2 = (n: number) => (n < 10 ? "0" + n : String(n));
// #endregion

const VERT =
  "attribute vec2 aPos;" +
  "uniform vec2 uRes;uniform vec2 uSize;uniform float uX;uniform float uBend;uniform float uVel;uniform float uIntro;uniform float uLift;" +
  "varying vec2 vUv;varying float vX;" +
  "void main(){" +
  "vec2 p=vec2(uX+(aPos.x-.5)*uSize.x,(aPos.y-.5)*uSize.y);" +
  "p.y-=(1.-uIntro)*uSize.y*.9;" +
  "vec2 n=p/(uRes*.5);" +
  "float x=clamp(n.x,-1.4,1.4);" +
  "n.y*=1.+uBend*x*x;" +
  "n.y+=uVel*.05*sin(aPos.x*3.14159)*(aPos.y-.5);" +
  "n.x*=1.-.06*uBend*x*x;n.y+=uLift;" +
  "vUv=aPos;vX=x;" +
  "gl_Position=vec4(n,0.,1.);}";

const FRAG =
  "precision highp float;" +
  "uniform sampler2D uTex;uniform vec2 uSize;uniform float uAspect;uniform float uVel;uniform float uIntro;uniform float uShift;uniform float uReady;" +
  "varying vec2 vUv;varying float vX;" +
  "float box(vec2 q,vec2 b,float r){vec2 d=abs(q)-b+r;return length(max(d,0.))+min(max(d.x,d.y),0.)-r;}" +
  "void main(){" +
  "float a=uSize.x/uSize.y;vec2 uv=vUv-.5;" +
  "if(uAspect>a)uv.x*=a/uAspect;else uv.y*=uAspect/a;" +
  "uv=uv/1.12+.5;uv.x+=uShift;" +
  "float ca=(.0012+.0045*vX*vX)*(1.+abs(uVel)*1.2);" +
  "vec3 c=vec3(texture2D(uTex,uv+vec2(ca,0.)).r,texture2D(uTex,uv).g,texture2D(uTex,uv-vec2(ca,0.)).b);" +
  "c=mix(vec3(.13,.14,.18),c,uReady);" +
  "c*=1.-.42*min(1.,vX*vX);" +
  "float d=box((vUv-.5)*uSize,uSize*.5,18.);" +
  "float rim=smoothstep(-5.,0.,d);" +
  "c+=rim*.10;" +
  "c+=.07*smoothstep(.55,1.,vUv.y)*(1.-abs(vX));" +
  "float al=smoothstep(.75,-.75,d)*uIntro;" +
  "gl_FragColor=vec4(c*al,al);}";

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

/** segX × segY ızgara, 0..1 */
function grid(segX: number, segY: number) {
  const out: number[] = [];
  for (let y = 0; y < segY; y++)
    for (let x = 0; x < segX; x++) {
      const x0 = x / segX, x1 = (x + 1) / segX, y0 = y / segY, y1 = (y + 1) / segY;
      out.push(x0, y0, x1, y0, x0, y1, x0, y1, x1, y0, x1, y1);
    }
  return new Float32Array(out);
}

/** Başlık harf harf yükselir (sitenin RiseText diliyle). Her kartta yeniden takılır;
    CSS animasyonu kendiliğinden başlar, ek kare beklemez. */
function Copy({ slide }: { slide: LensSlide }) {
  let k = 0;
  return (
    <div className="clc-copy" aria-live="polite">
      {slide.kicker && <span className="label clc-kicker">{slide.kicker}</span>}
      <p className="clc-title">
        {slide.title.split(" ").map((w, wi, all) => (
          <Fragment key={wi}>
            <span className="clc-word">
              {[...w].map((ch, i) => (
                <span key={i} className="clc-ch" style={{ animationDelay: 30 + k++ * 16 + "ms" }}>
                  {ch}
                </span>
              ))}
            </span>
            {wi < all.length - 1 ? " " : null}
          </Fragment>
        ))}
      </p>
      {slide.caption && <span className="clc-cap">{slide.caption}</span>}
    </div>
  );
}

export default function CurvedCarousel({ slides, label, hint = "Sürükle · dokun", bend = 0.55, speed = 0.12, height = "min(92svh, 52rem)", className = "" }: Props) {
  const n = slides.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [index, setIndex] = useState(0);
  const [noGL, setNoGL] = useState(false);
  const api = useRef({ go: (_d: number) => {} });

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root || n === 0) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false, alpha: true, powerPreference: "high-performance" });
    if (!gl) return setNoGL(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return setNoGL(true);
    gl.useProgram(prog);
    const mesh = grid(24, 8); // bükülme için yeterli, daha az köşe
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u: Record<string, WebGLUniformLocation | null> = {};
    for (const k of ["uRes", "uSize", "uX", "uBend", "uVel", "uIntro", "uTex", "uAspect", "uShift", "uReady", "uLift"]) u[k] = gl.getUniformLocation(prog, k);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    let disposed = false;
    const tex = slides.map((s) => {
      const t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([34, 37, 48, 255]));
      for (const [p, v] of [
        [gl.TEXTURE_MIN_FILTER, gl.LINEAR],
        [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
        [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
        [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
      ] as const)
        gl.texParameteri(gl.TEXTURE_2D, p, v);
      const entry = { t, aspect: 0.8, ready: false };
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.decoding = "async";
      im.onload = () => {
        if (disposed) return;
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
        entry.aspect = im.naturalWidth / im.naturalHeight;
        entry.ready = true;
        kick();
      };
      im.src = s.image;
      return entry;
    });

    let W = 1, H = 1, cw = 1, ch = 1, gap = 1;
    let pos = 0, vel = 0, target = 0;
    let intro = reduced.matches ? 1 : 0, introStart = -1;
    let dragging = false, dragX = 0, dragPos = 0, lastX = 0, lastT = 0, flick = 0, downX = 0, downY = 0, downT = 0;
    let raf = 0, last = 0, visible = false, seen = false, current = 0, nextStep = 0;
    let holdUntil = 0; // elle gezildikten sonra kendi kendine dönmeyi kısa süre beklet
    let boost = 0, lastScroll = window.scrollY;

    const resize = (w: number, h: number) => {
      W = Math.max(1, w);
      H = Math.max(1, h);
      const dpr = Math.min(1.5, window.devicePixelRatio || 1); // retina'da tuvali küçük tut: doldurma maliyeti yarıya iner
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      [cw, ch] = cardSize(W, H);
      gap = cw * 0.14;
      gl.viewport(0, 0, canvas.width, canvas.height);
      kick();
    };
    const lift = () => (W < 640 ? 0.3 : 0.12);

    const draw = () => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(u.uRes!, W, H);
      gl.uniform2f(u.uSize!, cw, ch);
      gl.uniform1f(u.uBend!, W < 640 ? bend * 0.45 : bend); // dar ekranda daha az bükülme
      gl.uniform1f(u.uVel!, reduced.matches ? 0 : Math.max(-1, Math.min(1, vel * 0.12)));
      gl.uniform1f(u.uLift!, lift());
      const step = cw + gap;
      for (let i = 0; i < n; i++) {
        const d = offsetOf(i, pos, n);
        const x = d * step;
        if (Math.abs(x) > W * 0.5 + step * 1.5) continue;
        const t = Math.max(0, Math.min(1, (intro - Math.abs(d) * 0.12) / 0.6));
        gl.bindTexture(gl.TEXTURE_2D, tex[i]!.t);
        gl.uniform1f(u.uX!, x);
        gl.uniform1f(u.uIntro!, 1 - Math.pow(1 - t, 3));
        gl.uniform1f(u.uAspect!, tex[i]!.aspect);
        gl.uniform1f(u.uReady!, tex[i]!.ready ? 1 : 0);
        gl.uniform1f(u.uShift!, Math.max(-0.05, Math.min(0.05, -d * 0.035)));
        gl.drawArrays(gl.TRIANGLES, 0, mesh.length / 2);
      }
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      if (intro < 1 && seen) {
        if (introStart < 0) introStart = now;
        intro = Math.min(1, (now - introStart) / 1300);
      }
      // sayfa kaydırıldıkça dönüş hızlanır
      const sy = window.scrollY;
      boost = Math.min(1.6, boost * 0.93 + Math.abs(sy - lastScroll) * 0.0025);
      lastScroll = sy;
      if (!dragging) {
        if (reduced.matches) {
          pos = target;
          vel = 0;
        } else if (now < holdUntil) {
          [pos, vel] = springStep(pos, vel, target, dt);
        } else if (W < 640) {
          // dar ekranda kartlar büyük: sürekli kayma yerine birer birer geçer, ortada hep bir kart durur
          if (!nextStep) nextStep = now + 3000;
          if (now >= nextStep) {
            target = Math.round(pos) + 1;
            nextStep = now + Math.max(1400, 3000 - boost * 1200);
          }
          [pos, vel] = springStep(pos, vel, target, dt, 7);
        } else {
          vel += (speed + boost - vel) * Math.min(1, dt * 3);
          pos += vel * dt;
          target = pos;
        }
      }
      const idx = wrap(Math.round(pos), n);
      if (idx !== current) {
        current = idx;
        setIndex(idx);
      }
      draw();
      if (visible && !(reduced.matches && intro >= 1 && Math.abs(target - pos) < 0.001)) raf = requestAnimationFrame(frame);
      else last = 0;
    };
    function kick() {
      if (!raf && visible && !disposed) raf = requestAnimationFrame(frame);
    }
    const hold = () => {
      holdUntil = performance.now() + 2600;
      nextStep = 0;
    };

    api.current.go = (dir: number) => {
      target = Math.round(pos) + dir;
      hold();
      kick();
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      dragX = lastX = downX = e.clientX;
      downY = e.clientY;
      lastT = downT = e.timeStamp;
      dragPos = pos;
      flick = 0;
      canvas.setPointerCapture(e.pointerId);
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const step = cw + gap;
      const dts = Math.max(1, e.timeStamp - lastT) / 1000;
      flick = flick * 0.6 + (-(e.clientX - lastX) / step / dts) * 0.4;
      vel = flick;
      lastX = e.clientX;
      lastT = e.timeStamp;
      pos = dragPos - (e.clientX - dragX) / step;
      kick();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      hold();
      // kısa ve kıpırdamadan bir dokunuş: kartı aç
      if (Math.abs(e.clientX - downX) < 6 && Math.abs(e.clientY - downY) < 6 && e.timeStamp - downT < 400) {
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left - W / 2;
        const cy = H / 2 - (lift() * H) / 2;
        const step = cw + gap;
        const d = Math.round(pos + x / step); // en yakın kart
        const onCard = Math.abs(x - (d - pos) * step) < cw / 2; // kartların arasındaki boşluk sayılmaz
        if (onCard && Math.abs(e.clientY - r.top - cy) < ch * 0.7) {
          const s = slides[wrap(d, n)];
          if (s?.href) window.open(s.href, "_blank", "noopener");
        }
        target = Math.round(pos);
      } else target = restFor(pos, flick);
      vel = flick;
      kick();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") api.current.go(1);
      else if (e.key === "ArrowLeft") api.current.go(-1);
      else return;
      e.preventDefault();
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp as (e: PointerEvent) => void);
    root.addEventListener("keydown", onKey);
    const ro = new ResizeObserver(([e]) => resize(e!.contentRect.width, e!.contentRect.height));
    ro.observe(root);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e!.isIntersecting;
        if (e!.intersectionRatio >= 0.3) seen = true;
        if (visible) kick();
      },
      { threshold: [0, 0.3] },
    );
    io.observe(root);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp as (e: PointerEvent) => void);
      root.removeEventListener("keydown", onKey);
      for (const t of tex) gl.deleteTexture(t.t);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [n, slides, bend, speed]);

  const slide = slides[index] ?? slides[0];
  if (!slide) return null;

  return (
    <div ref={rootRef} className={"clc-root " + className} style={{ height } as CSSProperties} tabIndex={0} role="region" aria-roledescription="carousel" aria-label="Canlı menüler">
      <div className="clc-glow" aria-hidden="true" />
      <canvas ref={canvasRef} className="clc-canvas" aria-hidden="true" />
      {noGL && <img className="clc-fallback" src={slide.image} alt={slide.title} />}
      <div className="clc-top label">
        <span>{label}</span>
        <span>{hint}</span>
      </div>
      <Copy key={index} slide={slide} />
      <div className="clc-ctl">
        {slide.href && (
          <a href={slide.href} target="_blank" rel="noopener" className="clc-open">
            Menüyü aç
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
        )}
        <span className="clc-count tabular">
          {pad2(index + 1)} <i>/ {pad2(n)}</i>
        </span>
        <span className="clc-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${(index + 1) / n})` }} />
        </span>
        <div className="flex gap-2.5">
          <button type="button" className="clc-btn" aria-label="Önceki menü" onClick={() => api.current.go(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button type="button" className="clc-btn" aria-label="Sonraki menü" onClick={() => api.current.go(1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
