import { useEffect } from "react";
import { useLocation } from "react-router";
import { ScrollTrigger } from "./gsap";

/* Zemin rengi kaydırırken akar (zeus-chemicals'taki sistemin sade hâli).
   `data-color="dark"` taşıyan bir bölüm ekranın %60'ına gelince <html data-theme="dark"> olur:
   sabit .page-tint katmanı opacity ile koyulaşır, yazı renkleri tek seferde döner.
   Kaydırma boyunca hiçbir şey çalışmaz; yalnızca sınır geçişinde bir attribute değişir. */

const META = { light: "#f3f0ea", dark: "#1b1e2b" };

function set(theme: "light" | "dark", instant = false) {
  const root = document.documentElement;
  if ((root.dataset.theme ?? "light") === theme) return;
  if (instant) {
    root.classList.add("theme-instant");
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-instant")));
  }
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", META[theme]);
}

export function useScrollTheme() {
  const { pathname } = useLocation();
  useEffect(() => {
    let triggers: ScrollTrigger[] = [];
    set("light", true);
    // sayfa içeriği (tembel yüklenen sayfalar dahil) yerleştikten sonra kur
    const t = setTimeout(() => {
      triggers = Array.from(document.querySelectorAll<HTMLElement>('[data-color="dark"]')).map((el) =>
        ScrollTrigger.create({ trigger: el, start: "top 60%", end: "bottom 40%", onToggle: (s) => set(s.isActive ? "dark" : "light") }),
      );
    }, 450);
    return () => {
      clearTimeout(t);
      triggers.forEach((x) => x.kill());
    };
  }, [pathname]);
}
