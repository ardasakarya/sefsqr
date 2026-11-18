import { useEffect, useRef } from "react";
import { about, DEMO, WA } from "../data/site";
import { gsap, reducedMotion, useGSAP } from "../lib/gsap";
import PageHero from "../components/PageHero";
import { DocDeck, ValuesList } from "../components/AboutMotion";
import { DriftWord, FadeUp, RevealFrame, RiseText, ScrollFillText } from "../components/motion";
import { DepthCollage, ParallaxPhoto } from "../components/Media";
import { img } from "../lib/media";
import { Btn, Icon, SmartLink } from "../components/ui";

/* Sorunlar listesi: kaydırdıkça her sorunun üstü çizilir — "çözüldü" */
function Problems() {
  const ref = useRef<HTMLUListElement>(null);
  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>(".pb-line", ref.current);
      if (reducedMotion) return items.forEach((i) => (i.style.transform = "scaleX(1)"));
      items.forEach((l) => gsap.fromTo(l, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: l.parentElement, start: "top 75%", end: "top 45%", scrub: 0.4 } }));
    },
    { scope: ref },
  );
  return (
    <ul ref={ref} className="flex flex-col">
      {about.problems.map((p, i) => (
        <li key={p} className="flex items-center gap-5 border-t border-line py-6 last:border-b">
          <span className="label text-accent">0{i + 1}</span>
          <span className="relative font-display text-[clamp(1.6rem,4vw,3.4rem)] leading-tight font-medium tracking-[-0.035em]">
            {p}
            <span className="pb-line absolute top-[55%] right-0 left-0 h-[3px] origin-left scale-x-0 rounded bg-[var(--c-accent)]" aria-hidden="true" />
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function About() {
  useEffect(() => {
    document.title = "Hakkımızda | SELF'S QR";
  }, []);
  return (
    <>
      <PageHero title="Masadaki karekodun *arkasındaki* ekip" lead={about.who} crumbs={[{ label: "Ana sayfa", href: "/" }, { label: about.title }]} image={img.warmHall} />

      {/* Biz kimiz: kaydırdıkça dolan cümle */}
      <section className="wrap flex min-h-[60svh] items-center py-16 md:min-h-[72svh]">
        <div className="md:pl-[8%]">
          <p className="label eyebrow">Biz kimiz?</p>
          <ScrollFillText as="h2" text={about.whoMore} className="t-2 mt-6 max-w-[26ch]" />
        </div>
      </section>

      {/* Metin + derinlikli fotoğraf kolajı */}
      <section className="wrap grid items-center gap-14 pb-24 md:min-h-[92svh] md:grid-cols-12 md:gap-8 md:py-12">
        <div className="md:col-span-5">
          <FadeUp>
            <p className="t-lead max-w-md text-mute">{about.how}</p>
          </FadeUp>
          <Btn href={DEMO} variant="soft" icon="arrowUR" className="mt-8">
            Canlı demo menüye göz atın
          </Btn>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <DepthCollage
            items={[
              { label: "Menüyü aktarıyoruz", img: img.chefPlating },
              { label: "QR kartları hazırlıyoruz", img: img.qrScan },
              { label: "Ekibe kısa eğitim", img: img.barista },
            ]}
          />
        </div>
      </section>

      {/* Sorunlardan yola çıktık */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <DriftWord word="Sahadan" className="left-0" />
        <div className="wrap relative grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label eyebrow">Neden?</p>
            <RiseText text="Sahadaki *gerçek* sorunlardan" className="t-2 mt-5 max-w-[14ch]" />
            <FadeUp>
              <p className="t-lead mt-6 max-w-md text-mute">{about.problem}</p>
            </FadeUp>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <Problems />
          </div>
        </div>
      </section>

      {/* Ne sunuyoruz: yapışkan sayaç */}
      <section className="wrap py-24 md:py-36">
        <ValuesList title={<RiseText text="Ne *sunuyoruz?*" className="t-2" />} values={about.offers} />
      </section>

      {/* Tam genişlik fotoğraf (zeus kurumsal sayfasındaki gibi) */}
      <div className="px-2 py-6 md:px-3">
        <RevealFrame className="h-[60svh] md:h-[86svh]">
          <ParallaxPhoto img={img.friends} amount={14} className="h-full !bg-transparent" />
        </RevealFrame>
      </div>

      {/* Nasıl çalışıyoruz: deste */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <DriftWord word="Birlikte" dir={-1} className="right-0" />
        <div className="wrap relative">
          <p className="label eyebrow">Nasıl çalışıyoruz?</p>
          <RiseText text="Kurulumu *birlikte* yapıyoruz" className="t-1 mt-6 max-w-[14ch]" />
          <DocDeck items={about.howSteps.map((t) => ({ t }))} />
        </div>
      </section>

      <div className="wrap py-10">
        <RevealFrame className="h-[50svh] md:h-[70svh]">
          <div className="relative grid h-full place-items-center bg-[radial-gradient(120%_100%_at_20%_10%,#c9d0f5,transparent_60%),radial-gradient(100%_100%_at_90%_90%,#f0b49c88,transparent_60%),#f6e8e1] p-8 text-center">
            <p className="max-w-[18ch] font-display text-[clamp(2rem,5vw,4.5rem)] leading-[1.02] font-medium tracking-[-0.04em] text-[#262b3d]">
              Kurulum <span className="em">ücretsiz.</span> 7 gün boyunca <span className="em">ücretsiz</span> deneyin.
            </p>
          </div>
        </RevealFrame>
      </div>

      {/* Blog ve içerik politikası */}
      <section className="py-24 md:py-36">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label eyebrow">İçerik</p>
            <RiseText text={about.blogPolicyTitle} className="t-2 mt-5 max-w-[14ch]" />
            <FadeUp>
              <p className="t-lead mt-6 max-w-md text-mute">{about.blogPolicy}</p>
              <p className="mt-6 text-sm text-mute">{about.errata}</p>
            </FadeUp>
          </div>
          <FadeUp as="ol" className="flex flex-col gap-4 lg:col-span-6 lg:col-start-7" stagger={0.1}>
            {about.principles.map((p, i) => (
              <li key={p} className="card flex gap-5 p-6">
                <span className="grid size-10 flex-none place-items-center rounded-xl bg-[var(--c-accent-soft)] text-sm font-extrabold text-[#262b3d]">{i + 1}</span>
                <p>{p}</p>
              </li>
            ))}
          </FadeUp>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="wrap flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="label eyebrow">İletişim</p>
            <RiseText text="Bir mesaj *uzağınızdayız*" className="t-2 mt-5 max-w-[14ch]" />
            <p className="t-lead mt-6 max-w-lg text-mute">{about.contact}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Btn href={WA} variant="wa" icon="wa">
              WhatsApp'tan yaz
            </Btn>
            <SmartLink href="/iletisim" className="btn btn-soft">
              İletişim sayfası <Icon name="arrow" className="arrow size-4" />
            </SmartLink>
          </div>
        </div>
      </section>
    </>
  );
}
