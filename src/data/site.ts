/* SELF'S QR — sitedeki tüm metinler (selfsqr.com ile birebir aynı içerik). */

export const WA = "https://wa.me/905393475664";
export const PHONE = "+90 539 347 56 64";
export const EMAIL = "info@selfsqr.com";
export const DEMO = "https://selfsqr.com/selfs";

export const nav = [
  { label: "Sistem", href: "#sistem" },
  { label: "Özellikler", href: "#ozellikler" },
  { label: "Menüler", href: "#menuler" },
  { label: "Fiyat", href: "#fiyat" },
  { label: "Blog", href: "/blog" },
  { label: "SSS", href: "#sss" },
];

export const hero = {
  eyebrow: "Hızlı · Modern · Gelişmiş",
  title: "Hızlı, modern ve gelişmiş QR menü.",
  lead: "Dakikalar içinde yayında olun. Menülerinizi her cihazdan yönetin, siparişleri anında alın.",
  primary: "WhatsApp'tan iletişime geç",
  secondary: "Nasıl çalışır?",
  note: "7 günlük ücretsiz deneme ile sistemi test edin — kart gerekmez.",
  badges: ["7 gün ücretsiz deneme", "Kurulum ücretsiz", "Aynı gün yayında"],
  toasts: [
    { t: "Yeni sipariş · Masa 12", d: "2× Latte, 1× Cheesecake" },
    { t: "Garson çağrısı", d: "Masa 4 · şimdi" },
  ],
};

export const flow = [
  { t: "QR okut", d: "Masadaki karekod, uygulama yok" },
  { t: "Menü açılır", d: "Her telefonda, güncel fiyatlarla" },
  { t: "Sipariş gider", d: "Masa numarasıyla panele düşer" },
  { t: "Servis gelir", d: "Garson çağrısı tek dokunuş" },
];

export const system = {
  eyebrow: "Sistem",
  title: "Bir menü sayfası değil, çalışan bir sistem",
  lead: "Üç iş tek yerde: menünüz her zaman güncel, sipariş panele düşer, servis aksamaz.",
  chapters: [
    {
      k: "01 — Menü",
      t: "Bir kere kurun, hep güncel kalsın",
      d: "Ürünleri panelden yönetin; teknik ekibimiz menünüzü sizinle birlikte kısa sürede yükler. Fiyat değişikliği anında menüye yansır.",
      list: [
        "Sınırsız ürün ve kategori — hazır görsel kütüphanesiyle",
        "Kalori ve alerjen etiketleri ürün kartında",
        "10 dilde otomatik çeviri — Arapça RTL dahil",
        "Duyuru slaytı ve şefin seçtikleri vitrini",
      ],
    },
    {
      k: "02 — Sipariş",
      t: "Masadan panele, saniyeler içinde",
      d: "Misafir sepetini oluşturur, masa numarasıyla gönderir. Sipariş anlık olarak yönetim panelinize düşer; garson da kendi panelinden girebilir.",
      list: [
        "Masa bazlı QR kodlar — PNG, SVG, PDF çıktısı",
        "Anlık sipariş bildirimi ve durum takibi",
        "Garsonlara özel sipariş paneli",
        "Adisyon API ile kasaya ve mutfağa aktarım",
      ],
    },
    {
      k: "03 — Servis",
      t: "Garson tek dokunuşla masada",
      d: "Misafir menüden garson çağırır; bildirim garson paneline ve kasaya aynı anda ulaşır. Menünün içinde işletmenizin küçük ama önemli detayları da hazır.",
      list: [
        "Tek dokunuşla garson çağırma",
        "WiFi şifresi menüde — sorulmasına gerek kalmaz",
        "Google yorum bağlantısı ile puan toplayın",
        "Instagram profiliniz menüden tek adım",
      ],
    },
  ],
};

export const stats = [
  { n: 15, suffix: "+", l: "Aktif işletme" },
  { n: 14, suffix: "", l: "Hazır tema" },
  { n: 10, suffix: "", l: "Dil desteği" },
  { n: 0, text: "7/24", suffix: "", l: "WhatsApp desteği" },
];

export type FeatureKind = "orders" | "waiter" | "price" | "cats" | "upload" | "lang" | "themes" | "stats" | "allergen";
export const features: { kind: FeatureKind; t: string; d: string; premium?: boolean; wide?: boolean }[] = [
  { kind: "orders", premium: true, wide: true, t: "Masadan sipariş sistemi", d: "Misafir menüden sepet oluşturur, masa numarasıyla gönderir. Sipariş anında panelinize düşer." },
  { kind: "waiter", premium: true, t: "Garson çağırma", d: "Misafir masadan tek dokunuşla çağırır. Bildirim garson paneline ve kasaya aynı anda ulaşır." },
  { kind: "price", t: "Toplu fiyat güncelleme", d: "Tek ürünü saniyeler içinde, tüm listeyi toplu araçla güncelleyin. Değişiklik anında menüye yansır." },
  { kind: "cats", t: "Ürün & kategori yönetimi", d: "Kategorileri sürükleyip sıralayın, ürünleri ekleyin veya gizleyin. Menü yapınız tam kontrolünüzde." },
  { kind: "upload", t: "Teknik ekip ile ürün yükleme", d: "Menünüzü birlikte hazırlıyoruz. Başvurudan sonra ekibimiz ürünlerinizi kısa sürede sisteme girer." },
  { kind: "lang", wide: true, t: "10 dilde otomatik çeviri", d: "Misafirin telefon diline göre menü otomatik çevrilir. Arapça sağdan sola (RTL) dahil." },
  { kind: "themes", t: "14 hazır tema", d: "Velvet, Coffee, Dark, Aqua, Litus, Rustic… Logonuz ve renklerinizle tek tıkta yayınlayın." },
  { kind: "stats", t: "Gelişmiş istatistik sistemi", d: "Menünüze kaç kişi baktı, hangi saatler yoğun, hangi ürünler ilgi çekti — hepsi panelinizde." },
  { kind: "allergen", t: "Kalori & alerjen etiketleri", d: "Gluten, süt, vegan, helal, acı ve AB alerjen seti ürün kartında görünür." },
];

export const adisyon = {
  eyebrow: "Adisyon entegrasyonu",
  title: "Kasanızla konuşan menü",
  lead: "Self's Adisyon veya kendi kasa yazılımınızla menünüz senkron çalışır. Siparişler ve garson çağrıları mutfak ekranına anında akar.",
  list: [
    "Ürün ve kategori senkronizasyonu",
    "Bekleyen QR siparişlerini görme ve kapatma",
    "Garson çağrılarını kasa ekranında görme",
    "Anlık bildirim — gecikme olmadan",
  ],
  panel: [
    { k: "Menü senkronu", v: "Güncel" },
    { k: "Bekleyen sipariş", v: "3 adet" },
    { k: "Garson çağrısı", v: "1 adet" },
    { k: "Son güncelleme", v: "Az önce" },
  ],
};

export const liveMenus = {
  eyebrow: "Canlı menüler",
  title: "Gerçek işletmeler, gerçek menüler",
  lead: "SELF'S QR kullanan işletmelerin menülerini şimdi açın — misafirlerin masada QR kodu okutunca gördüğü ekranın birebir aynısı.",
  cta: "Sizin menünüz de burada olsun. Menünüzü gönderin, aynı gün yayına alalım — 7 gün ücretsiz.",
  items: [
    { theme: "Coffee", name: "Acarzade Coffee", slug: "acarzadecoffee" },
    { theme: "Aqua", name: "Delfin Kafe", slug: "delfincafe" },
    { theme: "Dark", name: "Altunzade Cafe Restoran", slug: "altunzadecafe" },
    { theme: "Litus", name: "Ajlan Eos", slug: "ajlaneos" },
    { theme: "Velvet", name: "Hüma Cafe", slug: "humacafe" },
    { theme: "Orient", name: "Alorin Cafe", slug: "alorincafe" },
    { theme: "Coffee", name: "Altunzade & Rodin Park Hotel", slug: "altunzadehotel" },
    { theme: "Orient", name: "Self's Cafe", slug: "selfs" },
    { theme: "Dark", name: "Black Cafe", slug: "blackcafe" },
    { theme: "Velvet", name: "Çıtır Pide & Lahmacun Döner Salonu", slug: "citirpidelahmacun" },
    { theme: "Rustic", name: "Osmanlı Ocakbaşı - Kahta", slug: "osmanliocakbasi" },
    { theme: "Dark", name: "Gözde Döner", slug: "gozdedoner" },
    { theme: "Tropical", name: "Roll'n Döner", slug: "rollndoner" },
  ],
};

/* Temaların yumuşatılmış renk kartelası: [zemin, kart, yazı, vurgu] */
export const themes: { name: string; c: [string, string, string, string] }[] = [
  { name: "Velvet", c: ["#3d2b36", "#4f3946", "#f4e6ec", "#e7a9bf"] },
  { name: "Coffee", c: ["#efe4d8", "#fbf6f0", "#4a362a", "#b0805c"] },
  { name: "Dark", c: ["#22252e", "#2e323d", "#eceef3", "#a6b4f2"] },
  { name: "Aqua", c: ["#dff1f0", "#f5fbfb", "#1f4b52", "#5fb4b0"] },
  { name: "Litus", c: ["#f3ecdf", "#fdfaf4", "#334a5a", "#7fb0c9"] },
  { name: "Rustic", c: ["#e8dccb", "#f6efe4", "#4b3a2b", "#a8774f"] },
  { name: "Minimalist", c: ["#f5f5f3", "#ffffff", "#2b2b2b", "#9a9a9a"] },
  { name: "Essential", c: ["#eef0ec", "#fbfcfa", "#2e3a33", "#7ea38c"] },
  { name: "Tropical", c: ["#e4f2df", "#fbfdf7", "#27462e", "#f0b45f"] },
  { name: "Orient", c: ["#2c2a3a", "#393648", "#f3ead8", "#d9b66f"] },
];
export const themeOf = (name: string) => themes.find((t) => t.name.toLowerCase() === name.toLowerCase()) ?? themes[0];

export const themesSection = {
  eyebrow: "14 hazır tema",
  title: "Her mekâna uyan bir yüz",
  more: "+5 tema daha",
  lead: "Logonuz, renkleriniz ve arka plan görselinizle her tema işletmenize göre şekillenir. Tema değişikliği tek tık, anında yayında.",
  shown: ["Velvet", "Coffee", "Dark", "Aqua", "Litus", "Rustic", "Minimalist", "Essential", "Tropical"],
};

export const pricing = {
  eyebrow: "Fiyatlandırma",
  title: "Net fiyat, gizli kalem yok",
  lead: "WhatsApp'tan iletişime geçin — 7 günlük ücretsiz deneme ile başlayın. Kurulum ücretsiz, kart bilgisi istenmez.",
  trial: { t: "7 gün ücretsiz", d: "Önce test edin, beğenirseniz devam edin.", cta: "WhatsApp'tan dene" },
  periods: { year: "Yıllık — avantajlı", month: "Aylık" },
  plans: [
    {
      name: "Standart",
      for: "Dijital menüye geçmek isteyen işletmeler için",
      year: "₺5.000",
      month: "₺599",
      list: [
        "Sınırsız ürün ve kategori",
        "14 temanın tamamı",
        "Kalori, alerjen ve duyuru slaytı",
        "Teknik ekip desteği ve görsel kütüphane",
        "Menü istatistikleri",
        "Çoklu dil, sipariş ve garson çağrısı",
      ],
      cta: "Standart'ı dene",
      foot: "7 gün ücretsiz · WhatsApp'tan başlayın",
    },
    {
      name: "Premium",
      for: "Sipariş ve servis yönetimi isteyenler için",
      year: "₺7.000",
      month: "₺799",
      featured: true,
      list: [
        "Standart'taki her şey",
        "10 dilde çeviri — RTL dahil",
        "Masadan QR sipariş + anlık bildirim",
        "Garson çağırma ve garson paneli",
        "Masa bazlı QR (PNG / SVG / PDF)",
        "Adisyon API + öncelikli destek",
      ],
      cta: "Premium'u dene",
      foot: "7 gün ücretsiz · WhatsApp'tan aynı gün yanıt",
    },
  ],
};

export const blogSection = {
  eyebrow: "Blog",
  title: "Dijital menü rehberleri",
  lead: "Mevzuattan kuruluma, yazılım seçiminden kampanyalara — işletmeniz için hazırladığımız rehberler.",
};

export const faq = {
  eyebrow: "Merak edilenler",
  title: "Karar vermeden önce net cevaplar",
  items: [
    {
      q: "Ücretsiz deneme nasıl çalışır?",
      a: "WhatsApp'tan iletişime geçin; menünüzü aynı gün açalım. 7 gün boyunca sistemi ücretsiz test edersiniz — kart bilgisi gerekmez. Beğenirseniz devam edersiniz.",
    },
    {
      q: "QR menü yasal olarak geçerli mi?",
      a: "Evet. Ticaret Bakanlığı düzenlemesiyle, fiziki fiyat listesinin yanı sıra masa üstünde karekod ile menüye ulaşılması mümkündür.",
      links: [
        { label: "Resmi duyuru", href: "https://ticaret.gov.tr/haberler/ticaret-bakanligi-fiyat-etiketi-yonetmeliginde-tuketici-lehine-yeni-duzenlemeleri-hayata-geciriyor" },
        { label: "Detaylı rehber", href: "/blog/qr-menu-yasal-gecerliligi" },
      ],
    },
    {
      q: "Kurulum ne kadar sürer, donanım gerekir mi?",
      a: "Hesabınız aynı gün açılır; teknik ekibimiz menünüzü sizinle birlikte kısa sürede yükler. Donanım gerekmez — misafir kendi telefonunu, siz herhangi bir tarayıcıyı kullanırsınız.",
    },
    { q: "Müşteri uygulama indirmek zorunda mı?", a: "Hayır. QR kod telefon kamerasıyla okutulur, menü tarayıcıda anında açılır. Üyelik ve uygulama gerekmez." },
    {
      q: "Standart ve Premium farkı nedir?",
      a: "Standart: dijital menü, 14 tema, sınırsız ürün, duyuru, kalori-alerjen ve istatistik. Premium bunlara 10 dil, masadan sipariş, garson çağırma, masa bazlı QR, garson paneli ve adisyon API ekler.",
    },
    {
      q: "Siparişler nereye düşer?",
      a: "QR siparişleri anlık olarak yönetim panelinize düşer; garsonlar kendi panelinden masa siparişi girebilir. Adisyon API ile siparişleri kasa veya mutfak ekranına da aktarabilirsiniz.",
    },
    {
      q: "Fiyatları sonradan değiştirmek zor mu?",
      a: "Tek ürünü saniyeler içinde, tüm listeyi toplu araçlarla güncellersiniz. Değişiklik anında menüye yansır — yeniden baskı yok.",
    },
  ] as { q: string; a: string; links?: { label: string; href: string }[] }[],
};

export const finalCta = {
  eyebrow: "Başlamak için en iyi gün: bugün",
  title: "Bu akşam menünüz masada olsun",
  lead: "WhatsApp'tan iletişime geçin — 7 günlük ücretsiz deneme ile menünüzü aynı gün açalım. Kart gerekmez, taahhüt yok.",
  primary: "7 gün ücretsiz dene",
  secondary: "Örnek menüyü aç",
};

export const footer = {
  about: "Restoran ve kafeler için QR menü, sipariş ve servis altyapısı. Türkiye'de kurulur, her telefonda açılır.",
  cols: [
    {
      t: "Ürün",
      links: [
        { label: "Sistem", href: "/#sistem" },
        { label: "Özellikler", href: "/#ozellikler" },
        { label: "Adisyon API", href: "/#adisyon" },
        { label: "Fiyatlandırma", href: "/#fiyat" },
      ],
    },
    {
      t: "Keşfet",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "Temalar", href: "/#temalar" },
        { label: "Örnek menü", href: DEMO },
        { label: "SSS", href: "/#sss" },
      ],
    },
    {
      t: "Kurumsal",
      links: [
        { label: "Hakkımızda", href: "/hakkimizda" },
        { label: "İletişim", href: "/iletisim" },
        { label: EMAIL, href: `mailto:${EMAIL}` },
        { label: "WhatsApp destek", href: WA },
      ],
    },
  ],
  legal: [
    { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
    { label: "Çerez Politikası", href: "/cerez-politikasi" },
    { label: "KVKK Aydınlatma Metni", href: "/kvkk" },
    { label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
  ],
  copy: "© 2026 SELF'S QR — Tüm hakları saklıdır.",
};

/* Hakkımızda sayfası (selfsqr.com/hakkimizda içeriği, bölümlere ayrılmış) */
export const about = {
  title: "Hakkımızda",
  who: "SELF'S QR, Türkiye'deki restoran, kafe, fırın, döner salonu ve otel işletmeleri için geliştirilmiş bir QR menü ve dijital sipariş platformudur.",
  whoMore:
    "Misafir masadaki QR kodu okuttuğunda işletmenin güncel menüsü, uygulama indirmeye gerek kalmadan telefonunda açılır; isterse siparişini verir ya da tek dokunuşla garson çağırır.",
  problem:
    "Platformu, işletmelerin sahada yaşadığı somut sorunlardan yola çıkarak geliştiriyoruz: fiyat değiştikçe yeniden basılan menüler, yoğun saatlerde bekleyen masalar, yabancı misafirle yaşanan dil sorunu ve mutfağa yanlış iletilen siparişler.",
  problems: ["Yeniden basılan menüler", "Bekleyen masalar", "Dil sorunu", "Yanlış iletilen siparişler"],
  offers: [
    { t: "QR menü", d: "Kategori, ürün, fotoğraf, fiyat ve alerjen bilgisi panelden anında güncellenir; masadaki QR kod hiç değişmez." },
    { t: "Masadan sipariş", d: "Misafir siparişini telefondan verir, sipariş masa numarasıyla birlikte panele düşer." },
    { t: "Garson çağırma", d: "Hesap isteme ve servis çağrıları garson ekranına anında iletilir." },
    { t: "Çok dilli menü", d: "Menü 10 dilde görüntülenebilir; yabancı misafir menüyü kendi dilinde okur." },
    { t: "Tema seçenekleri", d: "İşletmenin konseptine uygun hazır temalar, logo ve renk ayarları." },
    { t: "Adisyon entegrasyonu", d: "Adisyon ve kasa sistemleriyle veri alışverişi için API." },
  ],
  how: "Her işletmenin kurulumunu birlikte yapıyoruz: menüyü sisteme aktarıyor, temayı ayarlıyor, QR kartları hazırlıyor ve ekibe kısa bir kullanım eğitimi veriyoruz. Kurulum ücretsizdir; işletmeler sistemi 7 gün boyunca ücretsiz deneyebilir. Destek taleplerine WhatsApp ve e-posta üzerinden doğrudan ekibimiz yanıt verir.",
  howSteps: ["Menüyü sisteme aktarıyoruz", "Temayı ayarlıyoruz", "QR kartları hazırlıyoruz", "Ekibe kısa eğitim veriyoruz"],
  demo: "Örnek bir menüyü incelemek için canlı demo menümüze göz atabilirsiniz.",
  blogPolicyTitle: "Blog ve içerik politikamız",
  blogPolicy:
    "SELF'S QR Blog'da QR menü mevzuatı, dijital menü kurulumu, yazılım seçimi ve restoran operasyonu üzerine rehberler yayımlıyoruz. Yazılarımızı hazırlarken şu ilkelere uyuyoruz:",
  principles: [
    "Mevzuatla ilgili bilgilerde resmi kaynaklara (Ticaret Bakanlığı duyuruları, Resmî Gazete) atıf yapar, kesin hukuki yorumdan kaçınırız.",
    "Doğrulayamadığımız istatistik ve iddiaları yayımlamayız.",
    "Mevzuat veya ürün değiştiğinde yazıları güncelleriz; güncelleme tarihi her yazıda görünür.",
    "Kendi ürünümüzden söz ettiğimiz yerleri açıkça belirtiriz.",
  ],
  errata: "Bir yazıda hata fark ederseniz info@selfsqr.com adresinden bize bildirebilirsiniz.",
  contact: "Sorularınız, iş birliği talepleriniz veya destek ihtiyaçlarınız için iletişim sayfamızdan bize ulaşabilirsiniz.",
};

export const contact = {
  title: "İletişim",
  info: [
    { k: "Firma", v: "SELF'S QR" },
    { k: "E-posta", v: EMAIL, href: `mailto:${EMAIL}` },
    { k: "WhatsApp / Telefon", v: PHONE, href: WA },
    { k: "Web", v: "selfsqr.com", href: "https://selfsqr.com" },
    { k: "Hizmet bölgesi", v: "Türkiye geneli (kurulum ve destek uzaktan yapılır)" },
  ],
  topicsTitle: "Hangi konuda yazabilirsiniz?",
  topics: [
    { t: "Yeni kurulum ve ücretsiz deneme", d: "İşletmenizin adını ve menünüzü (fotoğraf, PDF veya Excel) WhatsApp'tan gönderin; menünüzü genellikle aynı gün yayına alırız." },
    { t: "Teknik destek", d: "Mevcut müşterilerimiz panel, sipariş veya QR kod ile ilgili sorunlarını işletme adıyla birlikte iletebilir." },
    { t: "Fiyat ve paket bilgisi", d: "Standart ve Premium paketlerin içeriği için fiyatlandırma bölümüne bakabilir ya da bize yazabilirsiniz." },
    { t: "Adisyon ve API entegrasyonu", d: "Kullandığınız kasa veya adisyon yazılımının adını belirtin." },
    { t: "İş birliği ve basın", d: "Bayilik, ajans iş birlikleri ve içerik talepleri için e-posta tercih edin." },
  ],
  privacyTitle: "Kişisel verileriniz",
  privacy:
    "Bizimle iletişime geçtiğinizde paylaştığınız ad, telefon ve e-posta bilgileri yalnızca talebinizi yanıtlamak için kullanılır. Ayrıntılar için KVKK Aydınlatma Metni ve Gizlilik Politikası sayfalarımızı inceleyebilirsiniz. Kişisel verilerinize ilişkin başvurularınızı da info@selfsqr.com adresine iletebilirsiniz.",
};
