import { Fragment, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { gsap, lowPower, reducedMotion, ScrollTrigger, useGSAP } from "../lib/gsap";

/* Sitenin hareket dili. Hepsi kaydırmaya bağlı ve hafif: yalnızca transform / opacity / clip-path
   ya da tek bir CSS değişkeni (filtre yok, yeniden yerleşim yok). */

/* `*kelime*` → soluk tonlu vurgu (iki tonlu başlık). İtalik yok. */
function tokens(text: string) {
  const out: { w: string; em: boolean }[] = [];
  let em = false;
  text.split(/\s+/).filter(Boolean).forEach((raw) => {
    let w = raw;
    const open = w.startsWith("*");
    if (open) { em = true; w = w.slice(1); }
    const close = w.endsWith("*");
    if (close) w = w.slice(0, -1);
    out.push({ w, em });
    if (close) em = false;
  });
  return out;
}
const plain = (t: string) => t.replace(/\*/g, "");

/* ── Maskeli başlık: kelimeler alttan, kesme gibi yükselir ─────────────── */
export function RiseText({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
  stagger = 0.06,
  start = "top 86%",
  onLoad = false,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  start?: string;
  /** kaydırma beklemeden hemen oynat (hero) */
  onLoad?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (reducedMotion) return;
      const words = ref.current!.querySelectorAll(".rt-w");
      gsap.set(words, { yPercent: 115, rotate: 4 });
      const play = () => gsap.to(words, { yPercent: 0, rotate: 0, duration: 1.25, ease: "expo.out", stagger, delay });
      if (onLoad) play();
      else ScrollTrigger.create({ trigger: ref.current, start, once: true, onEnter: play });
    },
    { scope: ref, dependencies: [text] },
  );
  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{plain(text)}</span>
      <span aria-hidden="true">
        {tokens(text).map((t, i) => (
          <Fragment key={i}>
            <span className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
              <span className={`rt-w inline-block origin-bottom-left ${t.em ? "em" : ""}`}>{t.w}</span>
            </span>{" "}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

/* ── Kaydırınca dolan cümle (zeus kurumsal sayfasından) ───────────────── */
export function ScrollFillText({ text, as: Tag = "p", className = "" }: { text: string; as?: ElementType; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const words = tokens(text);
  const n = words.length;
  useGSAP(
    () => {
      const el = ref.current!;
      if (reducedMotion) return el.style.setProperty("--sf", String(n + 1));
      gsap.fromTo(el, { "--sf": 0 }, { "--sf": n + 1, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 42%", scrub: 0.4 } });
    },
    { scope: ref, dependencies: [text] },
  );
  return (
    <Tag ref={ref} className={className} style={{ ["--sf" as string]: 0 }}>
      <span className="sr-only">{plain(text)}</span>
      <span aria-hidden="true">
        {words.map((t, i) => (
          <Fragment key={i}>
            <span className={`sf-w ${t.em ? "em" : ""}`} style={{ ["--i" as string]: i }}>
              {t.w}
            </span>{" "}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

/* ── Arkada kayan büyük kontur kelime ─────────────────────────────────── */
export function DriftWord({ word, dir = 1, className = "" }: { word: string; dir?: 1 | -1; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (reducedMotion || !el) return;
      const s = (lowPower ? 8 : 16) * dir;
      gsap.fromTo(el, { xPercent: s }, { xPercent: -s, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    },
    { scope: ref },
  );
  return (
    <span ref={ref} aria-hidden="true" className={`drift ${className}`}>
      {word}
    </span>
  );
}

/* ── Alttan belirerek gelen içerik (çocuklar sırayla) ─────────────────── */
export function FadeUp({
  children,
  className = "",
  as: Tag = "div",
  stagger = 0.08,
  y = 40,
  start = "top 88%",
  each = false,
  style,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  stagger?: number;
  y?: number;
  start?: string;
  /** true: çocukların her biri ayrı ayrı (kendi konumunda) belirir */
  each?: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (reducedMotion) return;
      const kids = Array.from(ref.current!.children) as HTMLElement[];
      if (!kids.length) return;
      gsap.set(kids, { y, opacity: 0 });
      if (each) {
        kids.forEach((k) =>
          ScrollTrigger.create({ trigger: k, start, once: true, onEnter: () => gsap.to(k, { y: 0, opacity: 1, duration: 1.2, clearProps: "transform" }) }),
        );
      } else {
        ScrollTrigger.create({
          trigger: ref.current,
          start,
          once: true,
          onEnter: () => gsap.to(kids, { y: 0, opacity: 1, duration: 1.2, stagger, clearProps: "transform" }),
        });
      }
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}

/* ── Kenarlardan açılan çerçeve (zeus'taki RevealFrame) ───────────────── */
export function RevealFrame({ children, className = "", shut = "inset(14% 10% 14% 10% round 3rem)" }: { children: ReactNode; className?: string; shut?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (reducedMotion) return;
      const el = ref.current!;
      const st = { trigger: el, start: "top 95%", end: "center 60%", scrub: true };
      gsap.fromTo(el, { clipPath: shut }, { clipPath: "inset(0% 0% 0% 0% round 2rem)", ease: "none", scrollTrigger: st });
      gsap.fromTo(el.firstElementChild, { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: st });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={`overflow-hidden rounded-[2rem] ${className}`}>
      <div className="h-full w-full">{children}</div>
    </div>
  );
}

/* ── Paralaks katmanı: içerik sayfadan farklı hızda kayar ─────────────── */
export function Parallax({ children, speed = 0.2, className = "", style }: { children?: ReactNode; speed?: number; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (reducedMotion) return;
      const k = lowPower ? 0.5 : 1;
      gsap.fromTo(
        ref.current,
        { y: () => window.innerHeight * speed * k },
        { y: () => -window.innerHeight * speed * k, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } },
      );
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/* ── Ekrana girince sayan rakam ───────────────────────────────────────── */
export function Counter({ to, suffix = "", className = "" }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(reducedMotion ? to : 0);
  useGSAP(
    () => {
      if (reducedMotion) return;
      const o = { v: 0 };
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 90%",
        once: true,
        onEnter: () => gsap.to(o, { v: to, duration: 2, ease: "power3.out", onUpdate: () => setV(Math.round(o.v)) }),
      });
    },
    { scope: ref },
  );
  return (
    <span ref={ref} className={`tabular ${className}`}>
      {v}
      {suffix}
    </span>
  );
}

/* ── Sonsuz akan şerit ────────────────────────────────────────────────── */
export function Marquee({ children, duration = 40, reverse = false, className = "" }: { children: ReactNode; duration?: number; reverse?: boolean; className?: string }) {
  const style = { ["--dur" as string]: `${duration}s`, animationDirection: reverse ? "reverse" : undefined } as CSSProperties;
  return (
    <div className={`marquee ${className}`} aria-hidden="true">
      <div style={style}>{children}</div>
      <div style={style}>{children}</div>
    </div>
  );
}
