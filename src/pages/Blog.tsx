import { useEffect, useMemo, useRef, useState } from "react";
import { categories, posts } from "../data/blog";
import { gsap, reducedMotion, ScrollTrigger } from "../lib/gsap";
import PageHero from "../components/PageHero";
import { Icon } from "../components/ui";
import { PostCard } from "../sections/Closing";

const norm = (s: string) => s.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "");

export default function Blog() {
  const [cat, setCat] = useState("Tümü");
  const [q, setQ] = useState("");
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "QR Menü ve Dijital Menü Rehberleri | SELF'S QR Blog";
  }, []);

  const list = useMemo(() => {
    const k = norm(q.trim());
    return posts.filter((p) => (cat === "Tümü" || p.category === cat) && (!k || norm(`${p.title} ${p.lead} ${p.tags.join(" ")}`).includes(k)));
  }, [cat, q]);
  const [featured, ...rest] = list;

  // filtre değişince kartlar yeniden "kesme" ile belirir
  useEffect(() => {
    ScrollTrigger.refresh();
    if (reducedMotion || !grid.current) return;
    gsap.fromTo(grid.current.querySelectorAll(".post-card"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.06, clearProps: "transform" });
  }, [cat, q]);

  return (
    <>
      <PageHero
        title="QR menü ve dijital menü *rehberleri*"
        lead="Mevzuattan kuruluma, yazılım seçiminden kampanya stratejilerine: restoran ve kafeler için dijital menüye dair bilmeniz gereken her şey."
        crumbs={[{ label: "Ana sayfa", href: "/" }, { label: "Blog" }]}
      >
        <p className="ph-in label mt-8 text-accent">SELF'S QR Blog</p>
      </PageHero>

      <section className="pb-24 md:pb-36">
        <div className="wrap">
          <div className="flex flex-col gap-5 border-y border-line py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="-mx-[clamp(1rem,4vw,3.5rem)] flex gap-2 overflow-x-auto px-[clamp(1rem,4vw,3.5rem)] [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0">
              {[{ name: "Tümü", count: posts.length }, ...categories].map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setCat(c.name)}
                  aria-pressed={cat === c.name}
                  className={`chip !h-10 !px-4 !text-sm transition-colors ${cat === c.name ? "!bg-[var(--fg)] !text-[var(--bg)]" : "hover:!bg-black/10"}`}
                >
                  {c.name} <span className="opacity-50">{c.count}</span>
                </button>
              ))}
            </div>
            <label className="relative flex items-center lg:w-72">
              <Icon name="search" className="pointer-events-none absolute left-4 size-4 opacity-50" />
              <span className="sr-only">Yazılarda ara</span>
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Yazılarda ara"
                className="h-11 w-full rounded-full border border-line bg-white/60 pr-4 pl-11 text-sm outline-none focus:border-[var(--c-accent)]"
              />
            </label>
          </div>

          <div ref={grid}>
            {featured ? (
              <>
                <div className="mt-12 grid gap-8 lg:grid-cols-12">
                  <div className="lg:col-span-8">
                    <PostCard p={featured} big />
                  </div>
                  <div className="flex flex-col gap-10 lg:col-span-4">
                    {rest.slice(0, 1).map((p) => (
                      <PostCard key={p.slug} p={p} />
                    ))}
                  </div>
                </div>
                <div className="mt-16 grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
                  {rest.slice(1).map((p) => (
                    <PostCard key={p.slug} p={p} />
                  ))}
                </div>
              </>
            ) : (
              <p className="py-24 text-center text-mute">Aramanıza uygun yazı bulunamadı.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
