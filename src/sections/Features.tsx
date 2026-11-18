import { useRef } from "react";
import { adisyon, features, stats, type FeatureKind } from "../data/site";
import { gsap, lowPower, reducedMotion, useGSAP } from "../lib/gsap";
import { img, type Img } from "../lib/media";
import { Photo } from "../components/Media";
import { Counter, DriftWord, FadeUp, RevealFrame, RiseText } from "../components/motion";
import { Icon } from "../components/ui";

/* ── Özellikler: aralıksız, tam genişlik çekimler ──────────────────────
   Sabitleme yok, sayfa normal kayar: her çekim tam ekran, birbirine bitişik akar; fotoğraf
   içeride yavaş kayar (parallax), yazı alttan yükselir. Şimdilik fotoğraf; videolar hazır olunca
   SHOT'taki görselin yerine geçecek.
   Fotoğraf kutusunu ölçüp tam o ölçüde iner: yakınlaşma payı (ZOOM) dahil, piksellenmez. */
const SHOT: Partial<Record<FeatureKind, Img>> = {
  price: img.menuBoard,
  cats: img.tabletMenu,
  lang: img.candleDinner,
  stats: img.statsTablet,
  allergen: img.veganBowl,
};
const REEL = Object.keys(SHOT) as FeatureKind[];
const ZOOM = 1.14;

function ReelShot({ kind, i, n }: { kind: FeatureKind; i: number; n: number }) {
  const ref = useRef<HTMLElement>(null);
  const f = features.find((x) => x.kind === kind)!;
  useGSAP(
    () => {
      const el = ref.current!;
      if (reducedMotion) return;
      const k = lowPower ? 0.6 : 1;
      // sabitleme yok: çekimler tam ekran ve birbirine bitişik akar, biri bitince hemen altındaki gelir
      const span = { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.35 };
      // görüntü: çerçevenin içinde yavaş kayar, sahneye girerken hafifçe uzaklaşır
      gsap.fromTo(".fr-media", { yPercent: -13 * k }, { yPercent: 13 * k, ease: "none", scrollTrigger: span });
      gsap.fromTo(".fr-zoom", { scale: ZOOM }, { scale: 1, ease: "none", scrollTrigger: { ...span, end: "top top" } });
      // çıkışta görüntü kararır, bir sonraki çekim yumuşak gelir
      gsap.fromTo(".fr-shade", { opacity: 0 }, { opacity: 0.55, ease: "none", scrollTrigger: { ...span, start: "center top" } });
      // yazılar tek blok hâlinde kayar (etiket, başlık, açıklama birlikte); arkadaki numara daha yavaş
      gsap.fromTo(".fr-num", { yPercent: 35 * k }, { yPercent: -35 * k, ease: "none", scrollTrigger: span });
      gsap.fromTo(".fr-copy", { y: 160 * k }, { y: -160 * k, ease: "none", scrollTrigger: span });
      gsap.to(".fr-copy", { opacity: 0, ease: "none", scrollTrigger: { ...span, start: "55% top" } });
      // yazı alttan yükselir
      gsap.from(el.querySelectorAll(".rs-in"), { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: 0.09, scrollTrigger: { trigger: el, start: "top 45%", once: true } });
    },
    { scope: ref },
  );
  return (
    <article ref={ref} className="fr-item">
      <div className="fr-inner">
        <div className="fr-media absolute inset-x-0 -top-[18%] h-[136%]">
          <div className="fr-zoom size-full">
            <Photo img={SHOT[kind]!} zoom={ZOOM} />
          </div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(18,20,30,.85),rgba(18,20,30,.1)_55%,rgba(18,20,30,.3))]" />
        <div className="fr-shade absolute inset-0 bg-[var(--c-dark)] opacity-0" />
        <span className="fr-num pointer-events-none absolute top-[14%] right-[4vw] select-none md:top-auto md:bottom-[6%]" aria-hidden="true">
          {String(i + 1).padStart(2, "0")}
        </span>
        <div className="fr-copy wrap absolute inset-x-0 bottom-0 pb-12 text-white md:pb-20">
          <p className="fr-l label flex items-center gap-3 overflow-hidden text-white/70">
            <span className="rs-in inline-block">
              Özellik {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
          </p>
          <h3 className="fr-h t-1 mt-4 max-w-[14ch] overflow-hidden pb-[0.06em]">
            <span className="rs-in inline-block">{f.t}</span>
          </h3>
          <p className="fr-p t-lead mt-5 max-w-lg overflow-hidden text-white/80">
            <span className="rs-in inline-block">{f.d}</span>
          </p>
        </div>
      </div>
    </article>
  );
}

export function FeatureReel() {
  return (
    <section id="ozellikler" data-scene="Özellikler" data-color="dark" className="relative pt-24 md:pt-32">
      <div className="wrap mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label eyebrow">Özellikler</p>
          <RiseText text="Her gün *kullandığınız araçlar*" className="t-1 mt-6 max-w-[12ch]" />
        </div>
        <FadeUp>
          <p className="max-w-sm text-mute">Fiyat güncellemekten menü düzenine, çeviriden istatistiğe — işletmenin günlük işleri tek panelde.</p>
        </FadeUp>
      </div>
      <div className="flex flex-col">
        {REEL.map((k, i) => (
          <ReelShot key={k} kind={k} i={i} n={REEL.length} />
        ))}
      </div>
    </section>
  );
}

/* ── Adisyon entegrasyonu ──────────────────────────────────────────────── */
export function Adisyon() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.fromTo(".ad-panel", { y: 140 }, { y: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "center center", scrub: true } });
      gsap.from(".ad-row", { x: 30, opacity: 0, duration: 1, stagger: 0.08, scrollTrigger: { trigger: ".ad-panel", start: "top 75%", once: true } });
    },
    { scope: root },
  );
  return (
    <section ref={root} id="adisyon" data-scene="Adisyon" className="relative py-28 md:py-44">
      <div className="wrap grid items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="label eyebrow">{adisyon.eyebrow}</p>
          <RiseText text="Kasanızla *konuşan menü*" className="t-1 mt-7 max-w-[11ch]" />
          <p className="t-lead mt-8 max-w-md text-mute">{adisyon.lead}</p>
          <FadeUp as="ul" className="mt-10 flex flex-col">
            {adisyon.list.map((l) => (
              <li key={l} className="flex gap-3 border-t border-line py-3">
                <span className="check">
                  <Icon name="check" className="size-3" />
                </span>
                {l}
              </li>
            ))}
          </FadeUp>
        </div>
        <div className="relative pb-24 lg:col-span-6 lg:col-start-7 lg:pb-0">
          <RevealFrame className="aspect-[4/5] lg:ml-[16%]">
            <Photo img={img.posCounter} parallax={10} />
          </RevealFrame>
          <div className="ad-panel on-dark absolute right-0 -bottom-4 left-0 rounded-[1.4rem] bg-[var(--c-dark)] p-5 shadow-[0_50px_100px_-50px_rgba(20,22,32,.7)] sm:right-auto sm:w-[22rem] md:p-6 lg:-bottom-10 lg:-left-4">
            <div className="flex items-center justify-between">
              <p className="label text-mute">Adisyon bağlantısı</p>
              <span className="chip">
                <span className="dot-live" /> Canlı
              </span>
            </div>
            <ul className="mt-4 flex flex-col">
              {adisyon.panel.map((r) => (
                <li key={r.k} className="ad-row flex items-center justify-between border-t border-line py-3 text-sm">
                  <span className="text-mute">{r.k}</span>
                  <b className="font-medium">{r.v}</b>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Rakamlar ──────────────────────────────────────────────────────────── */
export function Stats() {
  return (
    <section data-scene="Rakamlar" className="relative overflow-hidden py-28 md:py-40">
      <DriftWord word="SELF'S QR" className="left-0" />
      <div className="wrap relative grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
        {stats.map((s) => (
          <FadeUp key={s.l} className="border-t border-line pt-6">
            <p className="text-[clamp(3.4rem,7.5vw,7rem)] leading-none font-medium tracking-[-0.05em] [font-stretch:118%]">{s.text ? s.text : <Counter to={s.n} suffix={s.suffix} />}</p>
            <p className="mt-3 text-mute">{s.l}</p>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
