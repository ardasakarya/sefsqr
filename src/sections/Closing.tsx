import { useLayoutEffect, useRef, useState } from "react";
import { blogSection, faq, pricing, WA } from "../data/site";
import { postsMeta as posts, type PostMeta as Post } from "../data/blog-meta";
import { gsap, reducedMotion, useGSAP } from "../lib/gsap";
import { FadeUp, Parallax } from "../components/motion";
import { Photo } from "../components/Media";
import { img, postPhoto } from "../lib/media";
import { Btn, Icon, SectionHead, SmartLink } from "../components/ui";

/* ── Fiyatlandırma ─────────────────────────────────────────────────────── */
export function Pricing() {
  const [period, setPeriod] = useState<"year" | "month">("year");
  const seg = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const b = seg.current?.querySelector<HTMLButtonElement>(`[data-p="${period}"]`);
      if (b) setPill({ left: b.offsetLeft, width: b.offsetWidth });
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [period]);

  useGSAP(
    () => {
      if (reducedMotion) return;
      gsap.fromTo(".plan", { y: 120, rotate: (i: number) => (i ? 4 : -4) }, { y: 0, rotate: 0, ease: "power2.out", stagger: 0.1, scrollTrigger: { trigger: ".plans", start: "top 95%", end: "top 45%", scrub: 0.6 } });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="fiyat" data-scene="Fiyat" className="relative overflow-x-clip py-24 md:py-36">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <SectionHead eyebrow={pricing.eyebrow} title="Net fiyat, *gizli kalem* yok" lead={pricing.lead} className="lg:col-span-7" />
          <FadeUp className="flex flex-col gap-5 lg:col-span-5 lg:items-end">
            <div className="flex w-full items-center gap-4 rounded-[1.5rem] bg-white/60 p-4 lg:max-w-sm">
              <span className="grid size-12 flex-none place-items-center rounded-2xl bg-[#9fd3c1]/60">
                <Icon name="sparkle" className="size-5" />
              </span>
              <span className="flex-1">
                <b className="block">{pricing.trial.t}</b>
                <span className="text-sm text-mute">{pricing.trial.d}</span>
              </span>
            </div>
            <a href={WA} target="_blank" rel="noopener" className="btn btn-soft btn-sm">
              <Icon name="wa" className="size-4" /> {pricing.trial.cta}
            </a>
          </FadeUp>
        </div>

        <div className="mt-14 flex justify-center">
          <div ref={seg} className="seg" role="group" aria-label="Ödeme dönemi">
            <span className="pill" style={pill} aria-hidden="true" />
            {(["year", "month"] as const).map((p) => (
              <button key={p} type="button" data-p={p} aria-pressed={period === p} onClick={() => setPeriod(p)} className={period === p ? "" : "opacity-60"}>
                {pricing.periods[p]}
              </button>
            ))}
          </div>
        </div>

        <div className="plans mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2 md:gap-6">
          {pricing.plans.map((p) => (
            <article key={p.name} className="plan" data-featured={!!p.featured}>
              <div className="flex items-center justify-between">
                <p className="label">{p.name}</p>
                {p.featured && <span className="chip !bg-[#aeb9f4] !text-[#262b3d]">Önerilen</span>}
              </div>
              <p className="mt-3 opacity-70">{p.for}</p>
              <div className="mt-8 flex items-baseline gap-2 overflow-hidden">
                <span key={period} className="price-num vl-digit font-display text-[clamp(3rem,6vw,4.6rem)] leading-none font-medium tracking-[-0.05em]">
                  {period === "year" ? p.year : p.month}
                </span>
                <span className="text-lg opacity-60">/ {period === "year" ? "yıl" : "ay"}</span>
              </div>
              <p className="mt-2 text-sm opacity-60">{period === "year" ? "yıllık tek ödeme" : "aylık ödeme"}</p>
              <ul className="mt-8 flex flex-col gap-3 border-t border-current/10 pt-8">
                {p.list.map((l) => (
                  <li key={l} className="flex gap-3">
                    <span className="check">
                      <Icon name="check" className="size-3" />
                    </span>
                    {l}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-10">
                <Btn href={WA} icon="arrow" className="w-full">
                  {p.cta}
                </Btn>
                <p className="mt-3 text-center text-sm opacity-60">{p.foot}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Blog kartı (anasayfa + blog sayfası ortak) ────────────────────────── */
export function PostCard({ p, big = false, parallax = false }: { p: Post; big?: boolean; parallax?: boolean }) {
  const ph = postPhoto[p.slug] ?? img.sunHall;
  const cover = (
    <div className={`relative overflow-hidden rounded-[1.4rem] bg-sand ${big ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
      <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-105">
        <Photo img={ph} zoom={1.05} parallax={9} />
      </div>
      <span className="glass absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold text-white">{p.category}</span>
    </div>
  );
  return (
    <SmartLink href={`/blog/${p.slug}`} className="post-card group flex flex-col">
      {parallax ? <Parallax speed={0.03}>{cover}</Parallax> : cover}
      <div className="mt-5 flex items-center gap-3 text-sm text-mute">
        <span className="chip">{p.category}</span>
        <span>{p.readTime}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={p.date}>{p.dateLabel}</time>
      </div>
      <h3 className={`mt-4 ${big ? "t-2" : "t-3"} transition-colors group-hover:text-accent`}>{p.title}</h3>
      <p className="mt-3 line-clamp-3 text-mute">{p.lead}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
        Oku <Icon name="arrow" className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
      </span>
    </SmartLink>
  );
}

export function BlogTeaser() {
  return (
    <section data-scene="Blog" className="py-24 md:py-36">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHead eyebrow={blogSection.eyebrow} title="Dijital menü *rehberleri*" lead={blogSection.lead} />
          <Btn href="/blog" variant="soft" icon="arrow" className="self-start md:self-auto">
            Tüm yazılar
          </Btn>
        </div>
        <FadeUp className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6" each>
          {posts.slice(0, 3).map((p) => (
            <PostCard key={p.slug} p={p} parallax />
          ))}
        </FadeUp>
      </div>
    </section>
  );
}

/* ── SSS ───────────────────────────────────────────────────────────────── */
export function Faq({ items = faq.items, title = "Karar vermeden önce *net* cevaplar", eyebrow = faq.eyebrow, id = "sss", scene = "SSS" }: { items?: { q: string; a: string; links?: { label: string; href: string }[] }[]; title?: string; eyebrow?: string; id?: string; scene?: string }) {
  const [open, setOpen] = useState(0);
  return (
    <section id={id} data-scene={scene} className="py-24 md:py-36">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionHead eyebrow={eyebrow} title={title} />
            <a href={WA} target="_blank" rel="noopener" className="btn btn-soft btn-sm mt-8">
              <Icon name="wa" className="size-4" /> Başka sorunuz mu var?
            </a>
          </div>
        </div>
        <FadeUp className="lg:col-span-7" stagger={0.05}>
          {items.map((it, i) => {
            const on = open === i;
            return (
              <div key={it.q} className="faq-item" data-open={on}>
                <h3>
                  <button type="button" className="summary w-full text-left" aria-expanded={on} onClick={() => setOpen(on ? -1 : i)}>
                    <span>{it.q}</span>
                    <span className="plus" aria-hidden="true" />
                  </button>
                </h3>
                <div className="faq-body">
                  <div>
                    <p className="max-w-2xl pb-7 text-mute">
                      {it.a}
                      {it.links?.map((l) => (
                        <SmartLink key={l.href} href={l.href} className="ml-3 font-semibold text-accent underline underline-offset-4">
                          {l.label}
                        </SmartLink>
                      ))}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </FadeUp>
      </div>
    </section>
  );
}
