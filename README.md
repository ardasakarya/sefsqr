# SELF'S QR — yeniden tasarım

selfsqr.com'un tek zeminli, fotoğraflı ve yumuşak renkli, "kurgulanmış video" hissi veren yeni sitesi. İçerik (metinler, fiyatlar, SSS, 10 blog yazısı, yasal sayfalar) orijinal siteyle birebir aynıdır.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:5191
npm run build    # dist/ klasörüne üretim çıktısı
```

## Yığın
- React 19 + Vite + TypeScript + Tailwind CSS 4, yazı tipi: Mona Sans (tek aile, italik yok)
- Hero: imleçle yanan karekod alanı (`src/components/QrField.tsx`) + siparişin masadan kasaya dolaştığı 3D iş akışı makinesi (`src/components/FlowMachine.tsx`, three.js, sonradan yüklenir)
- Fotoğraflar: Pexels lisanslı yer tutucular, tek dosyadan yönetilir: `src/lib/media.ts`
- GSAP ScrollTrigger + Lenis — sabitlenen sahneler, yatay film şeridi, paralaks, kesme/dip geçişleri
- React Router — `/`, `/blog`, `/blog/:slug`, `/hakkimizda`, `/iletisim`, yasal sayfalar

## İçerik nerede?
- `src/data/site.ts` — anasayfa, fiyatlar, SSS, hakkımızda, iletişim metinleri
- `src/data/posts.json` — blog yazıları · `src/data/pages.json` — yasal sayfalar

## Yayınlama
- **GitHub Pages:** `main` dalına her gönderimde `.github/workflows/deploy.yml` siteyi derler ve yayınlar
  (adres: `https://<kullanıcı>.github.io/<depo>/`). İlk seferde depo **Settings → Pages → Build and deployment →
  Source: GitHub Actions** seçilmeli. Site alt yolda yayınlandığı için derleme `BASE_PATH=/<depo>/` ile yapılır;
  doğrudan açılan sayfa adresleri için `404.html` = `index.html` kopyalanır.
- Tek sayfalık uygulama: Netlify için `public/_redirects`, Vercel için `vercel.json` de hazır (kök adreste, `BASE_PATH` gerekmez).
