import { useRef } from "react";
import { liveMenus, themes, themesSection, WA } from "../data/site";
import { gsap, lowPower, reducedMotion, useGSAP } from "../lib/gsap";
import { img, themePhoto } from "../lib/media";
import CurvedCarousel, { type LensSlide } from "../components/CurvedCarousel";
import { FadeUp } from "../components/motion";
import { Btn, SectionHead } from "../components/ui";

/* ── Temalar: menü ekranlarının silüeti, her temanın renkleriyle ───────── */
function Silhouette({ c }: { c: [string, string, string, string] }) {
  const [bg, card, fg, acc] = c;
  const ink = `color-mix(in srgb, ${fg} 22%, ${card})`;
  return (
    <div className="flex aspect-[9/16] flex-col gap-2.5 rounded-[1.4rem] p-4" style={{ background: bg }}>
      <div className="flex items-center justify-between">
        <span className="sk h-2.5 w-14" style={{ ["--sk-c" as string]: acc }} />
        <span className="sk size-5 rounded-full" style={{ ["--sk-c" as string]: ink }} />
      </div>
      <span className="sk h-4 w-20" style={{ ["--sk-c" as string]: fg, opacity: 0.85 }} />
      <span className="sk h-[22%] w-full !rounded-xl" style={{ ["--sk-c" as string]: `linear-gradient(135deg, ${acc}, ${card})` }} />
      <div className="flex gap-1.5">
        {[acc, card, card].map((x, i) => (
          <span key={i} className="sk h-4 flex-1 !rounded-full" style={{ ["--sk-c" as string]: x }} />
        ))}
      </div>
      {[0, 1, 2].map((r) => (
        <div key={r} className="flex items-center gap-2 rounded-xl p-2" style={{ background: card }}>
          <span className="sk size-8 flex-none !rounded-lg" style={{ ["--sk-c" as string]: ink }} />
          <span className="flex flex-1 flex-col gap-1.5">
            <span className="sk h-1.5 w-[80%]" style={{ ["--sk-c" as string]: fg, opacity: 0.55 }} />
            <span className="sk h-1.5 w-[50%]" style={{ ["--sk-c" as string]: fg, opacity: 0.25 }} />
          </span>
          <span className="sk h-2 w-6" style={{ ["--sk-c" as string]: acc }} />
        </div>
      ))}
    </div>
  );
}

export function Themes() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (reducedMotion) return;
      const k = lowPower ? 0.6 : 1;
      const st = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true };
      gsap.fromTo(".th-a", { xPercent: 2 * k }, { xPercent: -22 * k, ease: "none", scrollTrigger: st });
      gsap.fromTo(".th-b", { xPercent: -24 * k }, { xPercent: 0, ease: "none", scrollTrigger: st });
    },
    { scope: root },
  );
  const card = (t: (typeof themes)[number], k: number) => (
    <figure key={`${t.name}-${k}`} className="th-card w-[40vw] flex-none sm:w-[24vw] lg:w-[13.5rem]" style={{ ["--th-acc" as string]: t.c[3] }}>
      <div className="th-sil">
        <Silhouette c={t.c} />
        <span className="th-tag">{t.name}</span>
      </div>
      <figcaption className="mt-3 flex items-center justify-between text-sm">
        <span className="th-name font-medium">{t.name}</span>
        <span className="th-dots flex">
          {t.c.map((x, i) => (
            <span key={i} className="size-2.5 rounded-full ring-1 ring-black/10" style={{ background: x }} />
          ))}
        </span>
      </figcaption>
    </figure>
  );
  return (
    <section ref={root} id="temalar" data-scene="Temalar" className="relative overflow-hidden py-28 md:py-40">
      <div className="wrap grid gap-8 md:grid-cols-12 md:items-end">
        <SectionHead eyebrow={themesSection.eyebrow} title="Her mekâna *uyan bir yüz*" className="md:col-span-7" />
        <FadeUp className="md:col-span-4 md:col-start-9">
          <p className="text-mute">{themesSection.lead}</p>
        </FadeUp>
      </div>
      <div className="mt-16 flex flex-col gap-8">
        <div className="th-a flex gap-5 pt-3 pl-[8vw] md:gap-7">{[...themes.slice(0, 5), ...themes.slice(5, 8)].map((t, k) => card(t, k))}</div>
        <div className="th-b flex gap-5 pt-3 pl-[2vw] md:gap-7">{[...themes.slice(5), ...themes.slice(0, 3)].map((t, k) => card(t, k + 20))}</div>
      </div>
      <p className="wrap mt-10 text-sm text-mute">
        {themesSection.shown.join(" · ")} · {themesSection.more}
      </p>
    </section>
  );
}

/* ── Canlı menüler: kıvrık mercek karuseli ──────────────────────────────
   Kendi kendine yavaşça döner, kaydırınca hızlanır; sürüklenir, karta dokununca menü açılır. */
const MENU_SLIDES: LensSlide[] = liveMenus.items.map((m) => ({
  title: m.name,
  kicker: `${m.theme} teması`,
  caption: `selfsqr.com/${m.slug}`,
  image: (themePhoto[m.theme] ?? img.sunHall).url(640),
  href: `https://selfsqr.com/${m.slug}`,
}));

export function LiveMenus() {
  return (
    <section id="menuler" data-scene="Canlı menüler" data-color="dark" className="relative py-28 md:py-40">
      <div className="wrap">
        <SectionHead eyebrow={liveMenus.eyebrow} title="Gerçek işletmeler, *gerçek menüler*" lead={liveMenus.lead} />
      </div>
      <FadeUp className="mt-6 md:mt-10">
        <CurvedCarousel slides={MENU_SLIDES} label={`${MENU_SLIDES.length} canlı menü`} />
      </FadeUp>
      <div className="wrap mt-10 flex flex-col items-start justify-between gap-6 border-t border-line pt-8 md:flex-row md:items-center">
        <p className="max-w-md text-mute">{liveMenus.cta}</p>
        <Btn href={WA} icon="arrow" size="sm">
          Menümü oluştur
        </Btn>
      </div>
    </section>
  );
}
