import { useEffect, useLayoutEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { DEMO, EMAIL, finalCta, footer, nav, PHONE, WA } from "../data/site";
import { useScrollTheme } from "../lib/theme";
import { RiseText } from "./motion";
import { ScrollTrigger } from "../lib/gsap";
import { hashTarget, lenis, scrollToHash, scrollTop, startSmooth } from "../lib/smooth";
import Intro from "./Intro";
import { Icon, Logo, SmartLink } from "./ui";

/* ── Üst menü ──────────────────────────────────────────────────────────── */
function Header() {
  const { pathname } = useLocation();
  const home = pathname === "/";
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [onHero, setOnHero] = useState(home);

  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      const hero = document.getElementById("top");
      const over = !!hero && hero.getBoundingClientRect().bottom > 80;
      setOnHero(over);
      setSolid(!over && y > 30);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 500);
        last = y;
      }
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [pathname]);

  // anasayfada hangi bölümdeyiz?
  useEffect(() => {
    if (!home) return setActive(pathname.startsWith("/blog") ? "/blog" : "");
    const ids = nav.filter((n) => n.href.startsWith("#")).map((n) => n.href);
    let triggers: ScrollTrigger[] = [];
    const t = setTimeout(() => {
      triggers = ids.flatMap((id) => {
        const el = document.querySelector(id);
        return el
          ? [ScrollTrigger.create({ trigger: el, start: "top 50%", end: "bottom 50%", onToggle: (s) => setActive((a) => (s.isActive ? id : a === id ? "" : a)) })]
          : [];
      });
    }, 300);
    return () => {
      clearTimeout(t);
      triggers.forEach((x) => x.kill());
    };
  }, [home, pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);
  useEffect(() => setOpen(false), [pathname]);

  const href = (h: string) => (h.startsWith("#") && !home ? `/${h}` : h);

  return (
    <>
      <header className="site-header" data-solid={solid && !open} data-onhero={onHero && !open} data-hidden={hidden && !open}>
        <div className="wrap">
          <div className="bar">
            <SmartLink href={home ? "#top" : "/"} className="flex-none" aria-label="SELF'S QR anasayfa" onClick={() => home && scrollTop()}>
              <Logo />
            </SmartLink>
            <nav className="hidden items-center lg:flex" aria-label="Ana menü">
              {nav.map((n) => (
                <SmartLink key={n.href} href={href(n.href)} className="nav-link" data-active={active === n.href}>
                  {n.label}
                </SmartLink>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <a href={WA} target="_blank" rel="noopener" className="btn btn-soft btn-sm hidden sm:inline-flex">
                <Icon name="wa" className="size-4" /> WhatsApp
              </a>
              <a href={WA} target="_blank" rel="noopener" className="btn btn-sm">
                7 gün dene
              </a>
              <button type="button" className="burger lg:hidden" aria-expanded={open} aria-label="Menü" onClick={() => setOpen((o) => !o)}>
                <span />
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="drawer lg:hidden" data-open={open} aria-label="Mobil menü" aria-hidden={!open}>
        <div className="wrap flex min-h-full flex-col pt-28 pb-10">
          {nav.map((n, i) => (
            <SmartLink key={n.href} href={href(n.href)} className="big" style={{ ["--i" as string]: i }} onClick={() => setOpen(false)}>
              <span>{n.label}</span>
              <span className="label opacity-40">0{i + 1}</span>
            </SmartLink>
          ))}
          <div className="mt-auto flex flex-col gap-3 pt-10">
            <a href={WA} target="_blank" rel="noopener" className="btn btn-soft">
              <Icon name="wa" className="size-4" /> WhatsApp'tan yaz
            </a>
            <a href={WA} target="_blank" rel="noopener" className="btn">
              7 gün ücretsiz dene
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}

/* ── Alt bilgi: tam ekran, sade — tek bakışta iletişim ve tüm bağlantılar ── */
const FT_LINKS = [
  { label: "Sistem", href: "/#sistem" },
  { label: "Özellikler", href: "/#ozellikler" },
  { label: "Temalar", href: "/#temalar" },
  { label: "Fiyat", href: "/#fiyat" },
  { label: "SSS", href: "/#sss" },
  { label: "Blog", href: "/blog" },
  { label: "Hakkımızda", href: "/hakkimizda" },
  { label: "İletişim", href: "/iletisim" },
];
const FT_CONTACT = [
  { k: "WhatsApp", v: PHONE, href: WA, icon: "wa" as const },
  { k: "E-posta", v: EMAIL, href: `mailto:${EMAIL}`, icon: "mail" as const },
  { k: "Canlı demo", v: "Örnek menüyü aç", href: DEMO, icon: "arrowUR" as const },
];

function Footer() {
  return (
    <footer data-color="dark" data-scene="Final" className="relative flex min-h-[100svh] flex-col pt-24 md:pt-28">
      <div className="wrap flex flex-1 flex-col justify-center">
        <p className="label eyebrow">{finalCta.eyebrow}</p>
        <RiseText text="Bu akşam menünüz *masada olsun*" className="t-1 mt-6 max-w-[12ch]" />
        <div className="mt-10 flex flex-wrap gap-3">
          <a href={WA} target="_blank" rel="noopener" className="btn">
            <Icon name="wa" className="size-4" /> {finalCta.primary}
          </a>
          <SmartLink href="/iletisim" className="btn btn-soft">
            İletişim <Icon name="arrow" className="arrow size-4" />
          </SmartLink>
        </div>

        <ul className="mt-16 grid divide-y divide-line overflow-hidden rounded-2xl border border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0 md:mt-16">
          {FT_CONTACT.map((c) => (
            <li key={c.k}>
              <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="ft-cell group">
                <span className="label text-mute">{c.k}</span>
                <span className="flex items-center justify-between gap-3 text-lg font-medium md:text-xl">
                  {c.v}
                  <Icon name={c.icon} className="size-5 flex-none opacity-50 transition-opacity group-hover:opacity-100" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="wrap mt-12 border-t border-line pt-7 pb-7">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          <nav aria-label="Alt menü" className="ft-links flex flex-wrap gap-x-6 gap-y-3">
            {FT_LINKS.map((l) => (
              <SmartLink key={l.href} href={l.href} className="link-u">
                {l.label}
              </SmartLink>
            ))}
          </nav>
          <button type="button" className="link-u ft-tap" onClick={() => (lenis ? lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}>
            Başa dön ↑
          </button>
        </div>
        <div className="mt-6 flex flex-col gap-3 text-sm text-mute md:flex-row md:items-center md:justify-between">
          <p>{footer.copy}</p>
          <ul className="ft-links flex flex-wrap gap-x-5 gap-y-2">
            {footer.legal.map((l) => (
              <li key={l.href}>
                <SmartLink href={l.href} className="link-u">
                  {l.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* en altta dev "SELF'S QR" silüeti: sayfanın kapanış imzası, alt kenarı kesik */}
      <div className="ft-mark" aria-hidden="true">
        <span>
          SELF'S <em>QR</em>
        </span>
      </div>
    </footer>
  );
}

/* ── Sayfa değişiminde başa dön / çapaya git ───────────────────────────── */
function RouteScroll() {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    if (!hash) scrollTop();
    // Sayfa sonradan yüklenen bir parçaysa (blog, yazı…) hedef başlık henüz DOM'da olmayabilir: en çok ~4 sn bekle
    const until = performance.now() + 4000;
    let t = 0;
    const settle = () => {
      t = window.setTimeout(() => {
        if (hash && !hashTarget(hash) && performance.now() < until) return settle();
        ScrollTrigger.refresh();
        if (hash) scrollToHash(hash, true);
      }, 120);
    };
    settle();
    return () => clearTimeout(t);
  }, [pathname, hash]);
  return null;
}

export default function Layout() {
  useScrollTheme();
  useEffect(() => {
    startSmooth();
    // fontlar yüklenince ölçüler değişir
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);
  return (
    <>
      <a href="#icerik" className="skip">
        İçeriğe geç
      </a>
      <div className="page-tint" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <RouteScroll />
      <Header />
      <main id="icerik">
        <Outlet />
      </main>
      <Footer />
      <Intro />
    </>
  );
}
