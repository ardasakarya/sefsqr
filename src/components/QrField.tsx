import { useEffect, useRef } from "react";
import { reducedMotion } from "../lib/gsap";

/* Etkileşimli arka plan: karekod modüllerinden bir ızgara. İmleç (ya da parmak) gezdikçe
   çevresindeki kareler marka mavisiyle yanar ve yavaşça söner; boşta rastgele birkaç kare
   hafifçe parlar, köşelerde karekodun konum kareleri soluk durur. Tek bir 2D tuval — hafif.
   Ekranda değilken ya da sekme gizliyken çizim durur; hareketi azaltma ayarında sabit kalır. */
const CELL = 22; // px — bir modül + boşluk
const GAP = 4;

/* zeminin o anki tonu (hero fareye göre günceller); kareler de bu tonla yanar */
export const bgTone = { hue: 228 };

export default function QrField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const host = cv.parentElement!;
    const area: HTMLElement = cv.closest("section") ?? host; // üstte 3D sahne var: olayları bölümden dinle
    let cols = 0,
      rows = 0,
      dpr = 1,
      heat = new Float32Array(0), // her karenin parlaklığı (0..1)
      base = new Float32Array(0); // her karenin soluk taban değeri
    let mx = -9999,
      my = -9999,
      raf = 0,
      visible = true,
      last = performance.now(),
      lastPaint = 0,
      lastMove = 0,
      lastHue = "",
      hot = 0, // son çizimde yanan kare sayısı
      spark = 0; // boşta kendiliğinden parlayan kare sayacı

    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, host.clientWidth < 700 ? 1.5 : 2);
      const w = host.clientWidth,
        h = host.clientHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = w + "px";
      cv.style.height = h + "px";
      cols = Math.ceil(w / CELL) + 1;
      rows = Math.ceil(h / CELL) + 1;
      heat = new Float32Array(cols * rows);
      base = new Float32Array(cols * rows);
      // sabit desen: karekod hissi veren seyrek modüller (tohumlu)
      let seed = 11;
      const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
      for (let i = 0; i < base.length; i++) base[i] = rnd() > 0.86 ? 0.02 + rnd() * 0.03 : 0;
      draw(0);
    };

    // konum kareleri (karekodun üç köşe karesi) — sağ üstte ve sol altta soluk
    const finder = (cx: number, cy: number, a: number) => {
      const s = CELL;
      ctx.strokeStyle = `hsla(${bgTone.hue.toFixed(0)},65%,78%,${a})`;
      ctx.lineWidth = 2 * dpr;
      ctx.strokeRect((cx + 0.15) * s * dpr, (cy + 0.15) * s * dpr, 6.7 * s * dpr, 6.7 * s * dpr);
      ctx.fillStyle = `hsla(${bgTone.hue.toFixed(0)},65%,78%,${a * 0.9})`;
      ctx.fillRect((cx + 2) * s * dpr, (cy + 2) * s * dpr, 3 * s * dpr - GAP * dpr, 3 * s * dpr - GAP * dpr);
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      const r = 150; // imleç etki yarıçapı (px)
      const decay = Math.exp(-dt * 1.6);
      const m = (CELL - GAP) * dpr;
      const hue = bgTone.hue.toFixed(0);
      lastHue = hue;
      hot = 0;
      // boşta: ~0,4 sn'de bir rastgele bir kare kendiliğinden parlar (her karede zar atmak yerine)
      spark += dt;
      if (!reducedMotion && spark > 0.4) {
        spark = 0;
        const k = (Math.random() * heat.length) | 0;
        heat[k] = Math.max(heat[k]!, 0.45);
      }
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const k = j * cols + i;
          const x = i * CELL + CELL / 2,
            y = j * CELL + CELL / 2;
          const d = Math.hypot(x - mx, y - my);
          if (d < r) heat[k] = Math.max(heat[k]!, (1 - d / r) ** 1.6);
          else heat[k] = heat[k]! * decay;
          const h = heat[k]!,
            b = base[k]!;
          if (h > 0.01) hot++;
          if (h < 0.01 && !b) continue;
          // sıcak kare zeminin tonuyla yanar; soluk taban kareler aynı tonda
          ctx.fillStyle = h > 0.01 ? `hsla(${hue},70%,${62 + h * 14}%,${0.08 + h * 0.55})` : `hsla(${hue},65%,78%,${b})`;
          ctx.fillRect(i * CELL * dpr, j * CELL * dpr, m, m);
        }
      // konum kareleri: başlığın ve makinenin altında kalmasın diye kenarlara yakın, çok soluk
      finder(cols - 9, rows - 12, 0.06);
      finder(1, 5, 0.05);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      // yalnızca bir şey değiştiyse çiz: fare hareketi, yanan kare, ton değişimi.
      // fare durgunken ~20 kare/sn yeter (soluk parıltılar için)
      const moving = now - lastMove < 600;
      const changed = bgTone.hue.toFixed(0) !== lastHue;
      if (!moving && !changed && !hot && spark < 0.4) {
        spark += dt;
        return;
      }
      if (!moving && !changed && now - lastPaint < 50) return;
      draw(Math.min(0.1, (now - (lastPaint || now)) / 1000) || dt);
      lastPaint = now;
    };

    const move = (e: PointerEvent) => {
      const b = cv.getBoundingClientRect();
      mx = e.clientX - b.left;
      my = e.clientY - b.top;
      lastMove = performance.now();
    };
    const leave = () => {
      mx = my = -9999;
    };

    size();
    const ro = new ResizeObserver(size);
    ro.observe(host);
    const io = new IntersectionObserver(([en]) => (visible = !!en?.isIntersecting && !document.hidden), { threshold: 0 });
    io.observe(cv);
    const vis = () => (visible = !document.hidden);
    document.addEventListener("visibilitychange", vis);
    if (!reducedMotion) {
      area.addEventListener("pointermove", move, { passive: true });
      area.addEventListener("pointerleave", leave);
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true" />;
}
