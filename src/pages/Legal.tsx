import { useEffect, type MouseEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { pages } from "../data/legal";
import PageHero from "../components/PageHero";
import { SmartLink } from "../components/ui";

const LINKS = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
  { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" },
  { href: "/cerez-politikasi", label: "Çerez Politikası" },
  { href: "/kvkk", label: "KVKK" },
  { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
];

export default function Legal() {
  const { pathname } = useLocation();
  const slug = pathname.slice(1);
  const p = pages[slug]!;
  const nav = useNavigate();
  // içerikteki "/kvkk" gibi bağlantılar sayfayı baştan yüklemesin (ve /sefsqr/ altında kırılmasın);
  // sitede karşılığı olmayanlar (ör. /selfs — örnek menü) selfsqr.com'a gider
  const ROUTES = ["", "blog", "hakkimizda", "iletisim", "gizlilik-politikasi", "cerez-politikasi", "kvkk", "kullanim-kosullari"];
  const onProse = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest("a");
    const href = a?.getAttribute("href");
    if (!href?.startsWith("/")) return;
    e.preventDefault();
    const first = href.slice(1).split(/[/#?]/)[0]!;
    if (ROUTES.includes(first)) nav(href);
    else window.open(`https://selfsqr.com${href}`, "_blank", "noopener");
  };
  useEffect(() => {
    document.title = `${p.title} | SELF'S QR`;
  }, [p]);
  return (
    <>
      <PageHero title={p.title} lead={p.lead} crumbs={[{ label: "Ana sayfa", href: "/" }, { label: p.title }]}>
        {p.updated && <p className="ph-in mt-6 text-sm text-mute">Son güncelleme: {p.updated}</p>}
      </PageHero>
      <section className="pb-24 md:pb-36">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="prose min-w-0 lg:col-span-8" onClick={onProse} dangerouslySetInnerHTML={{ __html: p.html }} />
          <nav className="lg:col-span-3 lg:col-start-10" aria-label="Kurumsal sayfalar">
            <div className="toc lg:sticky lg:top-28">
              {LINKS.map((l) => (
                <SmartLink key={l.href} href={l.href} className={pathname === l.href ? "!border-[var(--c-accent)] !text-[var(--fg)]" : ""}>
                  {l.label}
                </SmartLink>
              ))}
            </div>
          </nav>
        </div>
      </section>
    </>
  );
}
