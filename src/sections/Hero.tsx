import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { hero, liveMenus, themeOf, WA } from "../data/site";
import { gsap, reducedMotion, useGSAP } from "../lib/gsap";
import { onIntroReveal } from "../lib/intro";
import { Icon } from "../components/ui";
import QrField, { bgTone } from "../components/QrField";
import { FLOW, JOURNEY, type FlowApi, type StationId } from "../components/flow";

/* 3D makine three.js kullanır (~ağır): ayrı parça olarak sonradan yüklenir, ilk açılışı yavaşlatmaz */
const FlowMachine = lazy(() => import("../components/FlowMachine"));

const LINES = ["Hızlı, modern", "ve gelişmiş"];

/* Menüsü yayında olan işletmeler — logolar selfsqr.com'daki menülerinden gelir */
const BRANDS = [liveMenus.items.find((m) => m.slug === "selfs")!, ...liveMenus.items.filter((m) => m.slug !== "selfs").slice(0, 5)];
const logoOf = (slug: string) => `https://selfsqr.com/uploads/brand/logo/${slug}.webp`;

const initials = (name: string) =>
  name
    .replace(/[^\p{L}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toLocaleUpperCase("tr"))
    .join("");

/* Tek işletme logosu — yığının bir halkası; üzerine gelince yumuşakça yükselir, adı balonda yazar.
   Logo yüklenemezse tema renkleriyle baş harfler. */
function BrandLogo({ b, on, onPick, onHover }: { b: (typeof BRANDS)[number]; on: boolean; onPick: () => void; onHover: (h: boolean) => void }) {
  const [broken, setBroken] = useState(false);
  const t = themeOf(b.theme);
  return (
    <button
      type="button"
      onClick={onPick}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      aria-pressed={on}
      aria-label={`${b.name} menüsünü seç`}
      className="h-brand"
      data-on={on}
    >
      <span className="h-brand-in">
        {broken ? (
          <span className="grid size-full place-items-center rounded-full text-[0.72rem] font-semibold" style={{ background: t.c[0], color: t.c[3] }}>
            {initials(b.name)}
          </span>
        ) : (
          <img src={logoOf(b.slug)} alt="" loading="lazy" decoding="async" onError={() => setBroken(true)} className="size-full rounded-full object-contain p-1" />
        )}
      </span>
      <span className="h-tip" aria-hidden="true">
        <b>{b.name}</b>
        <span>
          <i style={{ background: t.c[3] }} /> {b.theme} teması
        </span>
      </span>
    </button>
  );
}

/* Adım simgeleri: 24x24 çizgi çizimler, yazı rengini alır */
const GLYPH: Record<StationId, ReactNode> = {
  // karekod
  table: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <path d="M14 14h2.5v2.5M20.5 14v6.5H17M14 20.5v-2" />
    </>
  ),
  // telefonda menü
  menu: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M9 7.5h6M9 11h6M9 14.5h4" />
    </>
  ),
  // tencere ve buhar
  kitchen: (
    <>
      <path d="M4 11.5h16v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
      <path d="M2.5 11.5h19M9 3.5c-1 1.3 1 2.2 0 3.6M14 3.5c-1 1.3 1 2.2 0 3.6" />
    </>
  ),
  // servis zili
  service: (
    <>
      <path d="M4 17.5a8 8 0 0 1 16 0z" />
      <path d="M2.5 20.5h19M12 9.5V7.5M10.5 7.5h3" />
    </>
  ),
  // kasa ve fiş
  cashier: (
    <>
      <rect x="3.5" y="11.5" width="17" height="9" rx="1.8" />
      <path d="M7.5 11.5V5.5h9v6M10 8.5h4M7 15.5h1M11.5 15.5h1M16 15.5h1" />
    </>
  ),
};

/* Makinenin altındaki panel.
   Genel görünüm: "Süreci izle" + beş istasyon düğmesi (basınca kamera o istasyona gider).
   Yakınlaşınca: "Genel görünüm" düğmesi geri küçültür. Süreçte: siparişin altı adımı, ilerleme çubuğu. */
function FlowPanel({
  active,
  zoomed,
  step,
  progressRef,
  onPick,
  onProcess,
  onBack,
}: {
  active: StationId | null;
  zoomed: boolean;
  step: number | null;
  progressRef: RefObject<HTMLSpanElement | null>;
  onPick: (id: StationId) => void;
  onProcess: () => void;
  onBack: () => void;
}) {
  const st = FLOW.find((f) => f.id === active);
  const j = step === null ? null : JOURNEY[step]!;
  return (
    <div className="h-flow">
      <div className="h-flow-top">
        {zoomed ? (
          <button type="button" className="h-act h-act-back" onClick={onBack}>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M7.5 10.5h6M15.5 15.5l5 5" />
            </svg>
            Genel görünüm
          </button>
        ) : (
          <button type="button" className="h-act" onClick={onProcess}>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M8 5.5v13l10.5-6.5z" />
            </svg>
            Süreci izle
            <span className="h-act-sub">karekoddan kasaya bir sipariş</span>
          </button>
        )}
      </div>

      {/* süreçteki sipariş: altı adım + ilerleme */}
      <div className="h-journey" hidden={step === null}>
        <ol className="h-jsteps">
          {JOURNEY.map((s, i) => (
            <li key={s.title} data-state={step === null ? "" : i < step ? "done" : i === step ? "now" : ""}>
              <i>{i + 1}</i>
              <span>{s.title}</span>
            </li>
          ))}
        </ol>
        <span className="h-jbar">
          <span ref={progressRef} />
        </span>
        <p className="h-jnow" aria-live="polite">
          {j && (
            <>
              <b>
                {step! + 1}/{JOURNEY.length} · {j.title}
              </b>{" "}
              — {j.detail}
            </>
          )}
        </p>
      </div>

      {/* istasyonlar */}
      <div hidden={step !== null}>
        <div className="h-steps" role="group" aria-label="İş akışının istasyonları">
          {FLOW.map((f) => (
            <button key={f.id} type="button" className="h-step" aria-pressed={active === f.id} onClick={() => onPick(f.id)}>
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                {GLYPH[f.id]}
              </svg>
              {f.label}
            </button>
          ))}
        </div>
        <p className="h-step-text" aria-live="polite">
          {st ? (
            <>
              <b>
                {String(st.step).padStart(2, "0")} · {st.label}
              </b>{" "}
              — {st.desc}
            </>
          ) : (
            <>
              Bütün masalar tek döngüde: karekod, sipariş, mutfak, masa, kasa. <span className="only-fine">Sürükleyip çevirin, bir istasyona dokunun.</span>
              <span className="only-coarse">İki parmakla çevirin, bir istasyona dokunun.</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

/* Açılış — arka plan katmanları (alttan üste): fareyle tonu değişen zemin ve ışık hâleleri, imleçle
   yanan karekod alanı, siparişin masadan kasaya dolaştığı 3D iş akışı makinesi (geniş ekranda sağda,
   dar ekranda altta; şeklin tamamı görünür) ve yazının okunması için yumuşak karartma. Yazılar en
   üstte; boş yerden sürükleyince makine döner. Kaydırınca katmanlar farklı hızlarda kayar. */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [pick, setPick] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const picked = BRANDS[pick]!;
  const shown = BRANDS[hover ?? pick]!;

  // iş akışı makinesi
  const api = useRef<FlowApi | null>(null);
  const [active, setActive] = useState<StationId | null>(null);
  const [ready, setReady] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [step, setStep] = useState<number | null>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const takeApi = useCallback((a: FlowApi | null) => (api.current = a), []);
  const onReady = useCallback(() => setReady(true), []);
  const onZoom = useCallback((z: boolean) => {
    setZoomed(z);
    if (!z) setActive(null);
  }, []);
  const pickStep = (id: StationId) => {
    if (active === id) {
      setActive(null);
      api.current?.overview();
    } else {
      setActive(id);
      api.current?.focusStation(id);
    }
  };
  const startProcess = () => {
    setActive(null);
    api.current?.startProcess();
  };
  const back = () => {
    setActive(null);
    api.current?.overview();
  };

  // zeminin tonu fareyle değişir: sağa gittikçe mavi → mor, sola turkuaza; yumuşakça izler
  useEffect(() => {
    const el = root.current!;
    if (reducedMotion) return;
    let tx = 0.7,
      ty = 0.4,
      x = tx,
      y = ty,
      raf = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dx = tx - x,
        dy = ty - y;
      if (Math.abs(dx) < 0.0005 && Math.abs(dy) < 0.0005) return;
      x += dx * 0.06;
      y += dy * 0.06;
      const hue = 196 + x * 84 - y * 18; // ~180 turkuaz … ~280 mor
      bgTone.hue = hue;
      el.style.setProperty("--hx", `${(x * 100).toFixed(1)}%`);
      el.style.setProperty("--hy", `${(y * 100).toFixed(1)}%`);
      el.style.setProperty("--hue", hue.toFixed(1));
    };
    el.addEventListener("pointermove", move, { passive: true });
    // hero ekranda değilken renk döngüsü durur
    const io = new IntersectionObserver(([en]) => {
      cancelAnimationFrame(raf);
      if (en?.isIntersecting) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener("pointermove", move);
    };
  }, []);

  useGSAP(
    (_, contextSafe) => {
      if (reducedMotion) return;
      // parallax: arka plan yavaş, yazılar hızlı, kart arada
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".h-bg", { yPercent: 14, ease: "none", scrollTrigger: st });
      gsap.to(".h-3d", { yPercent: 8, ease: "none", scrollTrigger: st });
      gsap.to(".h-copy", { y: () => -window.innerHeight * 0.28, opacity: 0.15, ease: "none", scrollTrigger: { ...st, invalidateOnRefresh: true } });
      gsap.to(".h-side", { y: () => -window.innerHeight * 0.12, ease: "none", scrollTrigger: { ...st, invalidateOnRefresh: true } });
      gsap.to(".h-foot", { opacity: 0, ease: "none", scrollTrigger: { ...st, end: "40% top" } });
      gsap.to(".h-spin", { rotate: 220, ease: "none", scrollTrigger: st });

      gsap.set(".hl", { yPercent: 110 });
      gsap.set(".hero-mark", { "--mk": 0 });
      gsap.set(".h-in", { y: 22, opacity: 0 });
      gsap.set(".h-flow", { y: 30, opacity: 0 });
      gsap.set(".h-brand-in", { scale: 0.4, opacity: 0 });
      gsap.set(".h-badge", { scale: 0.6, opacity: 0, rotate: -40 });
      // contextSafe: animasyon hero'ya ait olsun (perdenin bağlamı kapanınca geri alınmasın)
      return onIntroReveal(
        contextSafe!(() => {
          gsap
            .timeline({ defaults: { ease: "expo.out" } })
            .to(".hl", { yPercent: 0, duration: 1.1, stagger: 0.07 }, 0.05)
            .to(".hero-mark", { "--mk": 1, duration: 0.7, ease: "expo.inOut" }, 0.4)
            .to(".h-in", { y: 0, opacity: 1, duration: 0.9, stagger: 0.07 }, 0.3)
            .to(".h-flow", { y: 0, opacity: 1, duration: 1.2 }, 0.5)
            .to(".h-brand-in", { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)", stagger: 0.06 }, 0.7)
            .to(".h-badge", { scale: 1, opacity: 1, rotate: 0, duration: 1.2 }, 0.6);
        }),
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" data-scene="Açılış" className="hero relative min-h-[100svh] overflow-hidden text-white" data-zoom={zoomed}>
      {/* arka plan: fareyle tonu değişen zemin + ışık hâleleri + imleçle yanan karekod alanı */}
      <div className="h-bg absolute inset-0" aria-hidden="true">
        <div className="h-glow absolute inset-0" />
        <QrField />
      </div>
      {/* iş akışı makinesi: yazının altında, şeklin tamamı görünür */}
      <div className="h-3d absolute inset-0" data-ready={ready}>
        <Suspense fallback={null}>
          <FlowMachine className="absolute inset-0" onStation={setActive} onApi={takeApi} onReady={onReady} onZoom={onZoom} onStep={setStep} progressRef={progressRef} />
        </Suspense>
      </div>
      {/* yazının okunması için yumuşak karartma (makineye dokunmayı engellemez) */}
      <div className="h-scrim pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="h-ui wrap relative flex min-h-[100svh] flex-col pt-28 lg:pt-24">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-12 lg:gap-6">
          <div className="h-copy min-w-0 lg:col-span-6">
            {/* yakınlaşınca (istasyon / süreç) yazılar çekilir */}
            <div className="h-zf">
            <h1 className="hero-title">
              <span className="sr-only">{hero.title}</span>
              {LINES.map((l) => (
                <span key={l} className="block overflow-hidden pb-[0.06em]" aria-hidden="true">
                  <span className="hl block">{l}</span>
                </span>
              ))}
              <span className="block overflow-hidden pt-[0.04em] pb-[0.08em]" aria-hidden="true">
                <span className="hl block">
                  <span className="hero-mark">QR menü.</span>
                </span>
              </span>
            </h1>
            <p className="h-in t-lead mt-6 max-w-md text-white/80">Masadaki karekodu okutan misafir menüyü görür, sipariş verir, garsonu çağırır.</p>
            <div className="h-in mt-8 flex items-center gap-2">
              <a href={WA} target="_blank" rel="noopener" className="btn btn-light">
                <Icon name="wa" className="size-4" /> 7 gün ücretsiz dene
              </a>
              <a href={`https://selfsqr.com/${picked.slug}`} target="_blank" rel="noopener" className="h-round" aria-label="Örnek menüyü aç">
                <Icon name="arrowUR" className="size-4" />
              </a>
            </div>
            </div>
          </div>

          {/* dar ekranda makine bu boşluğun arkasında görünür; geniş ekranda adımlar makinenin altında */}
          <div className="h-side min-w-0 pt-[min(68vw,22rem)] lg:col-span-6 lg:col-start-7 lg:self-end lg:pt-0 lg:pb-2">
            <FlowPanel active={active} zoomed={zoomed} step={step} progressRef={progressRef} onPick={pickStep} onProcess={startProcess} onBack={back} />
          </div>
        </div>

        {/* alt şerit: logo yığını · dönen rozet · örnek menü — üçü aynı hizada */}
        <div className="h-zf">
        <div className="h-foot relative mt-8 grid grid-cols-1 items-center gap-y-5 pb-6 sm:grid-cols-[1fr_auto] md:pb-10 xl:grid-cols-[1fr_auto_1fr]">
          <div className="h-in flex items-center gap-4">
            <span className="h-stack" onPointerLeave={() => setHover(null)}>
              {BRANDS.map((b, k) => (
                <BrandLogo key={b.slug} b={b} on={k === pick} onPick={() => setPick(k)} onHover={(h) => setHover(h ? k : null)} />
              ))}
              <a href="#menuler" className="h-brand h-brand-more" aria-label="Tüm canlı menüler">
                <span className="h-brand-in">+{liveMenus.items.length - BRANDS.length}</span>
                <span className="h-tip" aria-hidden="true">
                  <b>Tüm menüler</b>
                  <span>Canlı menülere git</span>
                </span>
              </a>
            </span>
            <span className="text-xs leading-tight text-white/70">
              <b key={shown.slug} className="h-card-t block text-sm text-white">
                {shown.name}
              </b>
              15+ işletmenin menüsü yayında
            </span>
          </div>

          {/* dönen QR rozeti */}
          <div className="h-badge hidden justify-self-center xl:block" aria-hidden="true">
            <div className="h-spin relative grid size-24 place-items-center">
              <svg viewBox="0 0 120 120" className="badge-spin absolute inset-0 size-full">
                <defs>
                  <path id="h-circle" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" />
                </defs>
                <text className="fill-white/80 text-[9.5px] font-semibold tracking-[0.32em] uppercase">
                  <textPath href="#h-circle">Okut · Menüyü gör · Sipariş ver ·</textPath>
                </text>
              </svg>
              <span className="grid size-11 place-items-center rounded-full bg-white text-[var(--c-ink)]">
                <Icon name="qr" className="size-5" />
              </span>
            </div>
          </div>
          <a href={`https://selfsqr.com/${picked.slug}`} target="_blank" rel="noopener" className="h-in btn btn-soft justify-self-start sm:justify-self-end">
            Örnek menüyü aç <Icon name="arrowUR" className="size-4" />
          </a>
        </div>
        </div>
      </div>
    </section>
  );
}
