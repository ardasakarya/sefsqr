import { useRef, type ReactNode } from "react";
import { gsap, reducedMotion, useGSAP } from "../lib/gsap";
import type { Img } from "../lib/media";
import { ParallaxPhoto } from "./Media";
import { RevealFrame, RiseText } from "./motion";
import { SmartLink } from "./ui";

/* İç sayfaların açılışı: kırıntı yol, maskeli büyük başlık, süzülen pastel küreler.
   Aşağı kaydırınca başlık yavaşça geri çekilir (paralaks). */
export default function PageHero({
  title,
  lead,
  crumbs = [],
  children,
  image,
}: {
  title: string;
  lead?: string;
  crumbs?: { label: string; href?: string }[];
  children?: ReactNode;
  /** başlığın altında kenarlardan açılan, paralaks kayan fotoğraf */
  image?: Img;
}) {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.from(".ph-in", { y: 24, opacity: 0, duration: 1.2, stagger: 0.08, delay: 0.25 });
      gsap.to(".ph-copy", { yPercent: 18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".ph-orb-a", { yPercent: 40, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".ph-orb-b", { yPercent: -30, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
    },
    { scope: root },
  );
  return (
    <section ref={root} className="relative overflow-hidden pt-36 pb-16 md:pt-48 md:pb-24">
      <div className="ph-orb-a pointer-events-none absolute -top-[20%] right-[-10%] size-[55vmax] rounded-full bg-[radial-gradient(circle,#c9d0f5aa,transparent_62%)]" aria-hidden="true" />
      <div className="ph-orb-b pointer-events-none absolute bottom-[-30%] left-[-15%] size-[45vmax] rounded-full bg-[radial-gradient(circle,#f0b49c55,transparent_62%)]" aria-hidden="true" />
      <div className="ph-copy wrap relative">
        {crumbs.length > 0 && (
          <nav aria-label="Sayfa yolu" className="ph-in">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-mute">
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  {c.href ? (
                    <SmartLink href={c.href} className="link-u ft-tap">
                      {c.label}
                    </SmartLink>
                  ) : (
                    <span aria-current="page" className="line-clamp-1">
                      {c.label}
                    </span>
                  )}
                  {i < crumbs.length - 1 && <span aria-hidden="true">/</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <RiseText as="h1" onLoad delay={0.15} text={title} className="t-1 mt-8 max-w-[18ch]" />
        {lead && <p className="ph-in t-lead mt-7 max-w-2xl text-mute">{lead}</p>}
        {children}
      </div>
      {image && (
        <div className="relative mt-14 px-2 md:mt-20 md:px-3">
          <RevealFrame className="h-[52svh] md:h-[78svh]">
            <ParallaxPhoto img={image} className="h-full !bg-transparent" />
          </RevealFrame>
        </div>
      )}
    </section>
  );
}
