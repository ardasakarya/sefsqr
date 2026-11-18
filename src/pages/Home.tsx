import { useEffect } from "react";
import Hero from "../sections/Hero";
import System from "../sections/System";
import { Adisyon, FeatureReel, Stats } from "../sections/Features";
import { LiveMenus, Themes } from "../sections/Showcase";
import { BlogTeaser, Faq, Pricing } from "../sections/Closing";

/* Anasayfa bir "kurgu" gibi akar; her sahne yeni bir şey anlatır, hiçbir bilgi tekrar etmez:
   açılış (video + nasıl çalışır) → sistem (menü, sipariş, servis) → araçlar → kasa entegrasyonu
   → rakamlar → temalar → canlı menüler → fiyat → rehberler → SSS → kapanış (alt bilgi). */
export default function Home() {
  useEffect(() => {
    document.title = "QR Menü Sistemi — Menü, Sipariş ve Servis Tek Karekodda | SELF'S QR";
  }, []);
  return (
    <>
      <Hero />
      <System />
      <FeatureReel />
      <Adisyon />
      <Stats />
      <Themes />
      <LiveMenus />
      <Pricing />
      <BlogTeaser />
      <Faq />
    </>
  );
}
