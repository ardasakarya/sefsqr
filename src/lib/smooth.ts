import Lenis from "lenis";
import { gsap, ScrollTrigger, reducedMotion } from "./gsap";

/* Yumuşak kaydırma (Lenis) — ScrollTrigger ile aynı saatte çalışır.
   Dokunmatik cihazlarda tarayıcının kendi kaydırması kalır (Lenis varsayılanı). */
export let lenis: Lenis | null = null;

export function startSmooth() {
  if (reducedMotion || lenis) return;
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/** "#fiyat" gibi bir bölüme yumuşakça git */
export function scrollToHash(hash: string, immediate = false) {
  const el = hash ? document.querySelector<HTMLElement>(hash) : null;
  if (!el) return false;
  const offset = -72;
  if (lenis) lenis.scrollTo(el, { offset, immediate, duration: 1.6 });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: immediate ? "auto" : "smooth" });
  return true;
}

export function scrollTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}
