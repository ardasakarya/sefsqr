import { useRef, useState } from "react";
import { gsap, reducedMotion, useGSAP } from "../lib/gsap";
import { introReveal } from "../lib/intro";

/* Açılış (~2 sn) — logonun kendisi kurulur:
   1) dış çerçeve çizilir, 2) dört köşe karesi (QR konum kareleri) dışarıdan gelip yerine oturur,
   3) ortadaki halka çizilir, nokta belirir, açık mavi tarama çizgisi bir kez geçer,
   4) altında "SELF'S QR" harfleri yükselir; kenarlarda küçük künye, altta yüzdeyle dolan çizgi.
   Çıkış: koyu perde yukarı kalkar, arkasından marka mavisi ikinci perde onu takip eder ve sayfa açılır.
   Tık / tuş / teker / dokunma animasyonu hızlandırır. */
const WORD = "SELF'S QR";
const SQ = [
  [13, 13, -1, -1],
  [41, 13, 1, -1],
  [13, 41, -1, 1],
  [41, 41, 1, 1],
] as const;

export default function Intro() {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(reducedMotion);

  useGSAP(
    () => {
      if (reducedMotion) {
        introReveal();
        return;
      }
      const html = document.documentElement;
      html.style.overflow = "hidden";
      const release = () => (html.style.overflow = "");
      const pct = { v: 0 };
      const num = ref.current!.querySelector<HTMLElement>(".in-pct-n")!;

      const tl = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: () => setDone(true) });
      tl
        // künye ve yükleme çizgisi
        .from(".in-meta", { opacity: 0, y: 8, duration: 0.6, stagger: 0.05 }, 0)
        .fromTo(".in-bar i", { scaleX: 0 }, { scaleX: 1, duration: 1.45, ease: "power2.inOut" }, 0.05)
        .to(pct, { v: 100, duration: 1.45, ease: "power2.inOut", onUpdate: () => (num.textContent = String(Math.round(pct.v)).padStart(3, "0")) }, 0.05)
        // 1) dış çerçeve çizilir
        .fromTo(".in-frame", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, 0.05)
        // 2) köşe kareleri dışarıdan gelip oturur
        .from(".in-sq", { x: (i) => SQ[i]![2] * 26, y: (i) => SQ[i]![3] * 26, rotate: (i) => SQ[i]![2] * SQ[i]![3] * 90, scale: 0.2, opacity: 0, transformOrigin: "50% 50%", duration: 0.8, stagger: 0.06, ease: "back.out(1.6)" }, 0.25)
        // 3) halka çizilir, nokta belirir, tarama geçer
        .fromTo(".in-ring", { strokeDashoffset: 1, rotate: -90, transformOrigin: "50% 50%" }, { strokeDashoffset: 0, duration: 0.55, ease: "power2.out" }, 0.55)
        .from(".in-dot", { scale: 0, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(3)" }, 0.85)
        .fromTo(".in-scan", { yPercent: -60, opacity: 0 }, { yPercent: 560, opacity: 1, duration: 0.55, ease: "power1.inOut" }, 0.9)
        .to(".in-scan", { opacity: 0, duration: 0.12 }, ">-0.1")
        // 4) yazı yükselir
        .from(".in-ch", { yPercent: 115, duration: 0.7, stagger: 0.03 }, 0.8)
        .from(".in-tag", { opacity: 0, y: 10, duration: 0.6 }, 1.05)
        // çıkış: içerik hafifçe yukarı ve sönük, koyu perde kalkar, mavi perde takip eder
        .to(".in-stage", { y: -60, opacity: 0, duration: 0.6, ease: "power3.in" }, 1.55)
        .to(".in-panel", { yPercent: -100, duration: 0.85, ease: "expo.inOut" }, 1.6)
        .to(".in-accent", { yPercent: -100, duration: 0.85, ease: "expo.inOut" }, 1.72)
        .call(introReveal, [], 1.95)
        .call(release, [], 2.0);

      // yalnızca geliştirmede: ?introAt=0.6 açılışı o saniyede dondurur (tasarımı incelemek için)
      if (import.meta.env.DEV) {
        const at = new URLSearchParams(location.search).get("introAt");
        if (at) tl.pause(Number(at));
      }

      const fast = () => tl.timeScale(2.6);
      const evs = ["pointerdown", "keydown", "wheel", "touchmove"] as const;
      evs.forEach((e) => window.addEventListener(e, fast, { once: true, passive: true }));
      return () => {
        release();
        evs.forEach((e) => window.removeEventListener(e, fast));
      };
    },
    { scope: ref },
  );

  if (done) return null;
  return (
    <div ref={ref} className="intro" aria-hidden="true">
      <div className="in-accent" />
      <div className="in-panel">
        <div className="in-stage">
          <svg viewBox="0 0 64 64" className="in-mark">
            <rect className="in-frame" x="5" y="5" width="54" height="54" rx="13" pathLength={1} />
            {SQ.map(([x, y], i) => (
              <rect key={i} className="in-sq" x={x} y={y} width="10" height="10" rx="2.6" />
            ))}
            <circle className="in-ring" cx="32" cy="32" r="9" pathLength={1} />
            <circle className="in-dot" cx="32" cy="32" r="3.4" />
          </svg>
          <span className="in-scan" />
          <span className="in-word">
            {[...WORD].map((c, i) => (
              <span key={i} className={`in-ch ${i >= WORD.indexOf("QR") ? "text-[#9fb0f0]" : ""}`}>
                {c}
              </span>
            ))}
          </span>
          <span className="in-tag">Menü · Sipariş · Servis</span>
        </div>

        <span className="in-meta in-tl">QR menü sistemi</span>
        <span className="in-meta in-tr">selfsqr.com</span>
        <div className="in-meta in-bottom">
          <span>Restoran ve kafeler için</span>
          <span className="in-pct">
            <span className="in-pct-n">000</span>%
          </span>
        </div>
        <div className="in-bar">
          <i />
        </div>
      </div>
    </div>
  );
}
