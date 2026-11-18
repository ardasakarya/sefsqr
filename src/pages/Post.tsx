import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { postBySlug, posts, tocOf } from "../data/blog";
import { WA } from "../data/site";
import { ScrollTrigger } from "../lib/gsap";
import { scrollToHash } from "../lib/smooth";
import PageHero from "../components/PageHero";
import { FadeUp, RevealFrame } from "../components/motion";
import { ParallaxPhoto } from "../components/Media";
import { img, postPhoto } from "../lib/media";
import { Btn, Icon, SmartLink } from "../components/ui";
import { PostCard } from "../sections/Closing";
import NotFound from "./NotFound";

export default function Post() {
  const { slug = "" } = useParams();
  const p = postBySlug(slug);
  const nav = useNavigate();
  const body = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(0);

  useEffect(() => {
    if (p) document.title = `${p.title} | SELF'S QR Blog`;
  }, [p]);

  // okuma çubuğu + içindekiler takibi
  useEffect(() => {
    if (!p || !body.current) return;
    const el = body.current;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 30%",
      end: "bottom 70%",
      onUpdate: (s) => bar.current?.style.setProperty("--p", String(s.progress)),
    });
    const heads = Array.from(el.querySelectorAll<HTMLElement>("h2[id]"));
    const ts = heads.map((h) => ScrollTrigger.create({ trigger: h, start: "top 40%", onEnter: () => setActive(h.id), onLeaveBack: () => setActive((x) => (x === h.id ? "" : x)) }));
    return () => {
      st.kill();
      ts.forEach((t) => t.kill());
    };
  }, [p]);

  if (!p) return <NotFound />;
  const toc = tocOf(p);
  const i = posts.indexOf(p);
  const prev = posts[i + 1];
  const next = posts[i - 1];
  const related = posts.filter((x) => x.slug !== p.slug && x.category === p.category).concat(posts.filter((x) => x.slug !== p.slug && x.category !== p.category)).slice(0, 3);

  // yazı içindeki site içi bağlantılar sayfayı yenilemeden açılsın
  const onProse = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest("a");
    const href = a?.getAttribute("href");
    if (!a || !href) return;
    if (href.startsWith("#")) {
      e.preventDefault();
      scrollToHash(href);
    } else if (href.startsWith("/")) {
      e.preventDefault();
      nav(href);
    } else if (/^https?:/.test(href)) {
      a.target = "_blank";
      a.rel = "noopener";
    }
  };

  return (
    <article>
      <div ref={bar} className="read-bar" aria-hidden="true" />
      <PageHero title={p.title} lead={p.lead} crumbs={[{ label: "Ana sayfa", href: "/" }, { label: "Blog", href: "/blog" }, { label: p.title }]}>
        <div className="ph-in mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-mute">
          <span className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}apple-touch-icon.png`} alt="" width="36" height="36" className="size-9 rounded-xl" />
            <span>
              <b className="block text-[var(--fg)]">SELF'S QR Ekibi</b>
              <span>Dijital menü uzmanları</span>
            </span>
          </span>
          <span className="chip">{p.category}</span>
          <span className="flex items-center gap-1.5">
            <Icon name="calendar" className="size-4" />
            <time dateTime={p.date}>{p.dateLabel}</time>
          </span>
          {p.updatedLabel && <span>Güncellendi: {p.updatedLabel}</span>}
          <span className="flex items-center gap-1.5">
            <Icon name="clock" className="size-4" /> {p.readTime}
          </span>
        </div>
      </PageHero>

      <div className="wrap">
        <RevealFrame className="h-[clamp(14rem,44vw,36rem)]">
          <ParallaxPhoto img={postPhoto[p.slug] ?? img.sunHall} className="h-full !bg-transparent" />
        </RevealFrame>
      </div>

      <div className="wrap grid gap-12 py-16 md:py-24 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="flex flex-col gap-8 lg:sticky lg:top-28">
            <details className="toc rounded-2xl border border-line p-4 lg:border-0 lg:p-0" open>
              <summary className="label cursor-pointer list-none text-mute">İçindekiler</summary>
              <nav aria-label="İçindekiler" className="mt-4">
                {toc.map((t) => (
                  <a
                    key={t.id}
                    href={`#${t.id}`}
                    data-active={active === t.id}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToHash(`#${t.id}`);
                    }}
                  >
                    {t.label}
                  </a>
                ))}
              </nav>
            </details>
            <div className="on-dark hidden rounded-[1.4rem] bg-[var(--c-dark)] p-5 lg:block">
              <b className="block font-display text-lg font-medium">7 gün ücretsiz deneyin</b>
              <p className="mt-2 text-sm text-white/65">QR menü, sipariş ve garson çağırma — aynı gün yayında.</p>
              <a href={WA} target="_blank" rel="noopener" className="btn btn-soft btn-sm mt-5">
                <Icon name="wa" className="size-4" /> WhatsApp
              </a>
            </div>
          </div>
        </aside>

        <div className="min-w-0 lg:col-span-8 lg:col-start-5">
          <div ref={body} className="prose" onClick={onProse} dangerouslySetInnerHTML={{ __html: p.html }} />

          {p.faq.length > 0 && (
            <section className="mt-20" aria-labelledby="sik-sorulan-sorular">
              <h2 id="sik-sorulan-sorular" className="t-2">
                Sık sorulan <span className="em">sorular</span>
              </h2>
              <div className="mt-8">
                {p.faq.map((f, k) => (
                  <div key={f.q} className="faq-item" data-open={open === k}>
                    <h3>
                      <button type="button" className="summary w-full text-left" aria-expanded={open === k} onClick={() => setOpen(open === k ? -1 : k)}>
                        <span>{f.q}</span>
                        <span className="plus" aria-hidden="true" />
                      </button>
                    </h3>
                    <div className="faq-body">
                      <div>
                        <p className="pb-7 text-mute">{f.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {p.tags.length > 0 && (
            <ul className="mt-12 flex flex-wrap gap-2" aria-label="Etiketler">
              {p.tags.map((t) => (
                <li key={t} className="chip">
                  #{t}
                </li>
              ))}
            </ul>
          )}

          <FadeUp className="on-dark relative mt-14 overflow-hidden rounded-[2rem] bg-[var(--c-dark)] p-8 md:p-12">
            <div className="pointer-events-none absolute -top-1/2 -right-1/4 size-[30rem] rounded-full bg-[radial-gradient(circle,#7d8fe066,transparent_60%)]" aria-hidden="true" />
            <h2 className="t-2 relative">
              Menünüz bu akşam <span className="em">masada olsun</span>
            </h2>
            <p className="relative mt-4 max-w-md text-white/65">WhatsApp'tan iletişime geçin — 7 günlük ücretsiz deneme ile menünüzü aynı gün açalım.</p>
            <div className="relative mt-8 flex flex-wrap gap-3">
              <Btn href={WA} variant="wa" icon="wa">
                7 gün ücretsiz dene
              </Btn>
            </div>
          </FadeUp>

          <nav className="mt-14 grid gap-4 md:grid-cols-2" aria-label="Diğer yazılar">
            {prev && (
              <SmartLink href={`/blog/${prev.slug}`} className="card group p-6 transition-transform duration-500 hover:-translate-y-1">
                <span className="label text-mute">← Önceki yazı</span>
                <b className="mt-3 block font-display text-lg leading-snug font-medium group-hover:text-accent">{prev.title}</b>
              </SmartLink>
            )}
            {next && (
              <SmartLink href={`/blog/${next.slug}`} className="card group p-6 text-right transition-transform duration-500 hover:-translate-y-1 md:col-start-2">
                <span className="label text-mute">Sonraki yazı →</span>
                <b className="mt-3 block font-display text-lg leading-snug font-medium group-hover:text-accent">{next.title}</b>
              </SmartLink>
            )}
          </nav>
        </div>
      </div>

      <section className="py-24 md:py-32">
        <div className="wrap">
          <h2 className="t-2">
            Bunlar da <span className="em">ilginizi çekebilir</span>
          </h2>
          <FadeUp className="mt-12 grid gap-10 md:grid-cols-3 md:gap-6" each>
            {related.map((r) => (
              <PostCard key={r.slug} p={r} />
            ))}
          </FadeUp>
        </div>
      </section>
    </article>
  );
}
