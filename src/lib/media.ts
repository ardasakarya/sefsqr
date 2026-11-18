/* Görsel kaynakları — tek yerden yönetilir (zeus-chemicals ile aynı yaklaşım).
   Pexels lisanslı (ticari kullanıma serbest) yer tutucu çekimler CDN üzerinden gelir;
   CDN genişliğe göre boyutlandırır ve WebP verir. İşletmenin kendi fotoğrafları geldiğinde
   yalnızca bu dosya değişir. CDN CORS izni verdiği için canlı menü karuselinde WebGL dokusu olarak da kullanılır. */

export interface Img {
  /** genişliğe göre boyutlanmış (oran korunur) */
  url: (w: number) => string;
  /** tam bu ölçüde kırpılmış — çerçevenin dışında kalan piksel hiç inmez */
  crop: (w: number, h: number) => string;
  alt: string;
}

const PX = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fm=webp`;
const photo = (id: number, alt: string): Img => ({
  url: (w) => `${PX(id)}&w=${w}`,
  crop: (w, h) => `${PX(id)}&fit=crop&w=${w}&h=${h}`,
  alt,
});

export const img = {
  // mekânlar
  sunHall: photo(13871340, "Güneş alan, ahşap masalı ferah restoran salonu"),
  warmHall: photo(14590691, "Sıcak ışıklı, yuvarlak masalı restoran iç mekânı"),
  bustling: photo(12181619, "Yemek yiyen misafirlerle dolu canlı bir restoran"),
  brightBistro: photo(32568165, "Aydınlık, bitkilerle süslü modern bistro"),
  cozyTable: photo(18177440, "Bitkiler ve sarkıt lambayla sıcak bir köşe masası"),
  cafeSeats: photo(12640476, "Ahşap masalı, duvar raflı sakin kafe"),
  diningRoom: photo(3822749, "Loş ışıklı şık yemek salonu"),
  barWindow: photo(4784165, "Pencere kenarında rustik bar ve şarap şişeleri"),
  cafeLight: photo(27706147, "Sıcak ışıklı kafe iç mekânı"),
  terrace: photo(18823963, "Hasır sandalyeli, yeşillikler içinde akşam terası"),
  parkPatio: photo(15337046, "Şehir parkına bakan restoran verandası"),
  redCanopy: photo(29011070, "Kırmızı tenteli, ahşap sandalyeli açık hava kafesi"),
  // insanlar ve servis
  qrScan: photo(2451622, "Telefonla duvardaki karekodu okutan el"),
  phonePay: photo(37594390, "Masada telefonuyla temassız işlem yapan çift"),
  waiterSalad: photo(262978, "Misafire salata ve başlangıç servis eden garson"),
  waiterPlates: photo(25809274, "Kalabalık restoranda tabak taşıyan garson"),
  waiterGroup: photo(25809277, "Bir masaya salata servis eden garson"),
  chefs: photo(27685507, "Yoğun mutfakta yemek hazırlayan iki şef"),
  chefPlating: photo(38958593, "Tabağı özenle süsleyen şef"),
  openKitchen: photo(4253296, "Açık mutfakta çalışan şefler"),
  barista: photo(15533806, "Sıcak bir kafede kahve hazırlayan baristalar"),
  baristaSmile: photo(13736419, "Tezgâhta kahve servis eden gülümseyen barista"),
  friends: photo(9961871, "Restoranda gülerek yemek yiyen arkadaş grubu"),
  friendsPizza: photo(36729762, "Kafede pizza ve kahve paylaşan arkadaşlar"),
  couple: photo(2696065, "Restoranda sohbet eden misafirler"),
  // tabaklar
  cheesecake: photo(32517227, "Tabakta San Sebastian cheesecake dilimi"),
  latte: photo(4913342, "Köpüğünde desen olan cappuccino"),
  latteTable: photo(14335866, "Güneşli mermer masada latte"),
  pasta: photo(5531093, "Kremalı soslu gurme makarna"),
  carbonara: photo(546945, "Parmesanlı spagetti carbonara"),
  // özellikler
  chalkMenu: photo(13736131, "Kafede kara tahta menüdeki fiyatları düzenleyen çalışan"),
  tabletMenu: photo(4921260, "Tablette ürün ve kategorileri seçen parmak"),
  teamLaptop: photo(4350059, "Kafede dizüstü bilgisayar başında çalışan ekip"),
  chefTablet: photo(12935057, "Mutfakta tabletten siparişleri yöneten şef"),
  posKitchen: photo(37594420, "Mutfakta sipariş ekranını kullanan restoran çalışanı"),
  posCounter: photo(12935100, "Kasada dokunmatik ekranla sipariş giren kafe çalışanı"),
  // özellik şeridi (tam ekran çekimler)
  menuBoard: photo(34056734, "Kafe tezgâhında kahve fiyatlarını gösteren küçük menü panosu"),
  candleDinner: photo(3938961, "Mum ışığında sofrada gülüşen farklı milletlerden arkadaşlar"),
  statsTablet: photo(106344, "Ahşap masada ziyaret grafiklerini gösteren tablet"),
  veganBowl: photo(19150338, "Taze sebzelerle hazırlanmış renkli vegan kase"),
};

export type ImgKey = keyof typeof img;

/* Temalara uygun mekân fotoğrafları */
export const themePhoto: Record<string, Img> = {
  Velvet: img.diningRoom,
  Coffee: img.cafeLight,
  Dark: img.barWindow,
  Aqua: img.parkPatio,
  Litus: img.terrace,
  Rustic: img.cozyTable,
  Minimalist: img.cafeSeats,
  Essential: img.sunHall,
  Tropical: img.redCanopy,
  Orient: img.warmHall,
};

/* Blog yazılarının kapakları */
export const postPhoto: Record<string, Img> = {
  "dijital-menu-ve-siparis-sistemi-kurulumu": img.openKitchen,
  "en-iyi-qr-menu-cozumleri-karsilastirma": img.phonePay,
  "qr-menu-yasal-gecerliligi": img.qrScan,
  "qr-menu-yazilimi-nasil-secilir": img.baristaSmile,
  "dijital-menu-secerken-dikkat-edilmesi-gerekenler": img.latteTable,
  "dijital-menu-trendleri": img.brightBistro,
  "dijital-menu-rehberi": img.chefPlating,
  "qr-menu-mutfak-servis-optimizasyonu": img.chefs,
  "dijital-menu-kampanyasi-stratejileri": img.friendsPizza,
  "online-menu-siparis-musteri-deneyimi": img.couple,
};
