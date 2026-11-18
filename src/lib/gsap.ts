import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
gsap.defaults({ ease: "expo.out", duration: 1.1 });
// Mobilde adres çubuğu açılıp kapanınca tüm tetikleyicileri yeniden hesaplama
ScrollTrigger.config({ ignoreMobileResize: true });

const mq = (q: string) => typeof window !== "undefined" && window.matchMedia(q).matches;

export const reducedMotion = mq("(prefers-reduced-motion: reduce)");
const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { deviceMemory?: number }) : undefined;
export const lowPower = !!nav && ((nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4);
export const finePointer = mq("(hover: hover) and (pointer: fine)");
export const isDesktop = () => mq("(min-width: 1024px)");

export { gsap, ScrollTrigger, SplitText, useGSAP };

if (import.meta.env.DEV) Object.assign(window, { __gsap: gsap, __ST: ScrollTrigger });
