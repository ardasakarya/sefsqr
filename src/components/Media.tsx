import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { gsap, lowPower, reducedMotion, useGSAP } from "../lib/gsap";
import type { Img } from "../lib/media";

/* Fotoğraf — kutusunu ölçer, CDN'den tam o oranda kırpılmış ve o genişlikte görsel ister.
   - Ölçülmeden hiçbir şey indirilmez (yanlış boyut inmesin); ekrana yaklaşınca yüklenir (lazy).
   - srcset 1x / 1.5x / 2x / 3x: tarayıcı ekranın piksel yoğunluğuna göre seçer, gereğinden büyüğü inmez.
     Üst sınır 2400 px: tam ekran fotoğrafta bile 2x ekranda keskin, dosya makul kalır.
   - zoom: içerideki görsel animasyonla büyütülüyorsa (ör. 1.14) çözünürlük ona göre artar → piksellenmez.
   - Yüklenirken aynı kırpımın 24 px'lik bulanık hâli gösterilir (~0.5 KB), asıl görsel üstüne yumuşakça gelir.
   - parallax: çerçeve sabit kalır, görsel içinde sayfadan yavaş kayar (değer = üst/alt taşma yüzdesi). */
const STEP = 160; // genişlikleri basamaklara yuvarla: benzer kutular aynı dosyayı paylaşsın, önbellek tutsun
const MAXW = 2400;

function pick(w: number, h: number, zoom: number) {
  const a = Math.round((w / h) * 20) / 20; // oranı 0.05 hassasiyetle sabitle
  const base = Math.min(MAXW, Math.ceil((w * zoom) / STEP) * STEP);
  return { a, base, css: Math.ceil(w * zoom) };
}

export function Photo({ img, className = "", priority = false, zoom = 1, parallax = 0 }: { img: Img; className?: string; priority?: boolean; zoom?: number; parallax?: number }) {
  const ref = useRef<HTMLImageElement>(null);
  const frame = useRef<HTMLSpanElement>(null);
  const pad = parallax ? (lowPower ? Math.min(parallax, 6) : parallax) : 0;
  useGSAP(
    () => {
      if (!pad || reducedMotion) return;
      const p = pad / (1 + (2 * pad) / 100); // taşma payı kadar kay, kenar hiç görünmesin
      gsap.fromTo(".ph-move", { yPercent: -p }, { yPercent: p, ease: "none", scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: 0.6 } });
    },
    { scope: frame, dependencies: [pad] },
  );
  const [box, setBox] = useState<ReturnType<typeof pick> | null>(null);
  const [loaded, setLoaded] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current!;
    const measure = () => {
      const w = el.offsetWidth, h = el.offsetHeight; // transform'lardan etkilenmez
      if (!w || !h) return;
      const n = pick(w, h, zoom);
      // yalnızca kutu büyüdüyse ya da oran belirgin değiştiyse (ör. telefon döndü) yeniden iste
      setBox((o) => (!o || n.base > o.base || Math.abs(n.a - o.a) > 0.15 ? n : o));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [zoom]);
  useEffect(() => {
    if (ref.current?.complete && ref.current.currentSrc) setLoaded(true);
  }, [box]);

  const src = (w: number) => img.crop(w, Math.round(w / box!.a));
  const set = box && [1, 1.5, 2, 3].map((k) => Math.min(MAXW, Math.ceil((box.css * k) / STEP) * STEP)).filter((w, i, all) => all.indexOf(w) === i);
  return (
    <span ref={frame} className="ph">
      <span className="ph-move" style={pad ? { top: `-${pad}%`, bottom: `-${pad}%` } : undefined}>
        {box && <img src={img.crop(24, Math.max(1, Math.round(24 / box.a)))} alt="" aria-hidden="true" loading={priority ? "eager" : "lazy"} decoding="async" className="ph-lq" />}
        <img
          ref={ref}
          src={set ? src(set[0]!) : undefined}
          srcSet={set ? set.map((w) => `${src(w)} ${w}w`).join(", ") : undefined}
          sizes={box ? `${box.css}px` : undefined}
          alt={img.alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`ph-img ${loaded ? "is-in" : ""} ${className}`}
        />
      </span>
    </span>
  );
}

/* Çerçeve sabit kalır, fotoğraf içinde sayfadan yavaş kayar. */
export function ParallaxPhoto({ img, className = "", amount = 12, children }: { img: Img; className?: string; amount?: number; children?: ReactNode }) {
  return (
    <div className={`relative overflow-hidden bg-sand ${className}`}>
      <Photo img={img} parallax={amount} />
      {children}
    </div>
  );
}

/* Derinlikli kolaj: üç fotoğraf farklı hızlarda kayar (öndeki daha hızlı).
   Ekrana girerken her biri alttan açılır, içindeki görüntü hafifçe uzaklaşır. */
const DEPTH = [5, -12, 20];

export function DepthCollage({ items }: { items: { label: string; note?: string; img: Img }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (reducedMotion) return;
      const k = lowPower ? 0.5 : 1;
      gsap.utils.toArray<HTMLElement>(".dc-card", ref.current).forEach((card, i) => {
        const s = DEPTH[i % DEPTH.length]! * k;
        gsap.fromTo(card, { yPercent: s }, { yPercent: -s, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } });
        const st = { trigger: ref.current, start: "top 82%", once: true };
        gsap.fromTo(card.querySelector(".dc-frame"), { clipPath: "inset(100% 0% 0% 0% round 1.4rem)" }, { clipPath: "inset(0% 0% 0% 0% round 1.4rem)", duration: 1.4, ease: "expo.out", delay: i * 0.16, scrollTrigger: st, clearProps: "clipPath" });
        gsap.fromTo(card.querySelector(".dc-pic"), { scale: 1.18 }, { scale: 1, duration: 1.8, ease: "expo.out", delay: i * 0.16, scrollTrigger: st, clearProps: "transform" });
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="relative aspect-[4/5] w-full md:aspect-auto md:h-[min(74svh,46rem)]">
      {items.slice(0, 3).map((it, i) => (
        <figure key={it.label} className="dc-card" data-n={i}>
          <div className="dc-frame">
            <div className="dc-pic">
              <Photo img={it.img} zoom={1.18} />
            </div>
            <figcaption className="dc-cap flex-col text-[0.68rem] leading-tight font-semibold sm:flex-row sm:text-xs">
              <span>{it.label}</span>
              {it.note && <span className="opacity-80">{it.note}</span>}
            </figcaption>
          </div>
        </figure>
      ))}
    </div>
  );
}
