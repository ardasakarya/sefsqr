import { useRef, useState, type ReactNode } from "react";
import { gsap, reducedMotion, ScrollTrigger, useGSAP } from "../lib/gsap";

/* zeus-chemicals kurumsal sayfasındaki hareketlerin SELF'S QR uyarlaması */

/* ── Yapışkan sayaç + sırayla öne çıkan maddeler ───────────────────────── */
export function ValuesList({ title, values }: { title: ReactNode; values: { t: string; d: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const n = values.length;
  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>(".vl-item", ref.current);
      if (reducedMotion || !items.length) return bar.current?.style.setProperty("--vp", "1");
      items.forEach((li, i) => ScrollTrigger.create({ trigger: li, start: "top 58%", end: "bottom 58%", onToggle: (s) => s.isActive && setActive(i) }));
      gsap.fromTo(bar.current, { "--vp": 0 }, { "--vp": 1, ease: "none", scrollTrigger: { trigger: items[0], endTrigger: items[items.length - 1], start: "top 58%", end: "bottom 58%", scrub: 0.4 } });
    },
    { scope: ref, dependencies: [n] },
  );
  const pad = (x: number) => String(x).padStart(2, "0");
  return (
    <div ref={ref} className="grid gap-12 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-4">
        <div className="md:sticky md:top-[28svh]">
          {title}
          <div className="mt-12 hidden md:block" aria-hidden="true">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-[7rem] leading-none font-medium tracking-[-0.06em]">
                <span key={active} className="vl-digit">
                  {pad(active + 1)}
                </span>
              </span>
              <span className="label text-mute">/ {pad(n)}</span>
            </div>
            <span ref={bar} className="vl-bar mt-6" style={{ ["--vp" as string]: 0 }} />
          </div>
        </div>
      </div>
      <ol className="md:col-span-7 md:col-start-6">
        {values.map((v, i) => (
          <li key={v.t} className="vl-item" data-active={i === active}>
            <span className="label text-accent">{pad(i + 1)}</span>
            <h3 className="t-2 mt-3">{v.t}</h3>
            <p className="t-lead mt-4 max-w-lg text-mute">{v.d}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── Belge destesi: ortada eğik deste → kaydırdıkça dağılıp yan yana oturur ── */
const TILT = [-7, -2.5, 3, 7.5];
export function DocDeck({ items }: { items: { t: string; d?: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const box = ref.current;
      if (reducedMotion || !box) return;
      const cards = gsap.utils.toArray<HTMLElement>(".qd-card", box);
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const toCenter = (_: number, el: HTMLElement) => box.offsetWidth / 2 - (el.offsetLeft + el.offsetWidth / 2);
        gsap
          .timeline({ scrollTrigger: { trigger: box, start: "top bottom", end: "top 25%", scrub: 0.6, invalidateOnRefresh: true } })
          .fromTo(cards, { x: toCenter, y: 160, rotation: (i: number) => TILT[i % 4]! }, { x: toCenter, y: (i: number) => i * 6, ease: "power1.out", duration: 0.35 })
          .to(cards, { x: 0, y: 0, rotation: 0, ease: "power2.inOut", duration: 0.65, stagger: 0.03 });
      });
      mm.add("(max-width: 1023px)", () => {
        cards.forEach((c, i) =>
          gsap.fromTo(c, { y: 60, rotation: i % 2 ? 3 : -3 }, { y: 0, rotation: 0, ease: "power2.out", scrollTrigger: { trigger: c, start: "top 98%", end: "top 70%", scrub: 0.5 } }),
        );
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [items.length] },
  );
  return (
    <div ref={ref} className="relative mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {items.map((x, i) => (
        <article key={x.t} className="qd-card" style={{ zIndex: items.length - i }}>
          <div className="qd-sheet">
            <span className="label opacity-60">{String(i + 1).padStart(2, "0")}</span>
            <div className="qd-lines" aria-hidden="true">
              <span className="qd-hl" />
              <span />
              <span />
            </div>
            <div className="mt-auto">
              <h3 className="t-3">{x.t}</h3>
              {x.d && <p className="mt-3 t-small opacity-70">{x.d}</p>}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
