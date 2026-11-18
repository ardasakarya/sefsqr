/* İş akışı makinesinin adımları — hero'daki düğmeler ve 3D sahne aynı listeyi kullanır.
   Ayrı dosyada: hero bunu içe aktarınca three.js ana pakete girmesin (makine sonradan yüklenir). */
export type StationId = "table" | "menu" | "kitchen" | "service" | "cashier";

export type FlowApi = {
  focusStation: (id: StationId) => void;
  overview: () => void;
  /** Tek bir siparişi baştan sona kamerayla takip et */
  startProcess: () => void;
  stopProcess: () => void;
};

/* istasyonlar (hero'daki düğmeler) */
export const FLOW: { id: StationId; label: string; step: number; desc: string }[] = [
  { id: "table", label: "Masa", step: 1, desc: "Misafir masadaki karekodu okutur, menü telefonunda açılır." },
  { id: "menu", label: "Menü", step: 2, desc: "Menüyü gezer, sepete ekler, siparişi masa numarasıyla gönderir." },
  { id: "kitchen", label: "Mutfak", step: 3, desc: "Sipariş anında mutfak ekranına düşer, hazırlanır." },
  { id: "service", label: "Servis", step: 4, desc: "Hazır yemek ve garson çağrısı garson paneline gelir." },
  { id: "cashier", label: "Kasa", step: 5, desc: "Hesap kasaya düşer, ödeme alınır, fiş basılır." },
];

/* Bir siparişin yolculuğu: "Süreci izle" bu adımları sırayla gösterir.
   at = sipariş döngüsündeki başlangıç anı (0..1), station = kameranın baktığı yer. */
export const JOURNEY: { title: string; detail: string; at: number; station: StationId }[] = [
  { title: "QR okutulur", detail: "Masa 4 · misafir karekodu okutur, menü açılır", at: 0, station: "table" },
  { title: "Sipariş verilir", detail: "Menü · sepet masa numarasıyla gönderilir", at: 0.1, station: "menu" },
  { title: "Mutfağa düşer", detail: "Mutfak ekranı · sipariş hazırlanıyor", at: 0.22, station: "kitchen" },
  { title: "Yemek olarak çıkar", detail: "Servis · garson paneline “hazır” düşer", at: 0.42, station: "service" },
  { title: "Masada yenir", detail: "Masa 4 · yemek masaya gelir, afiyet olsun", at: 0.56, station: "table" },
  { title: "Kasada ödenir", detail: "Kasa · hesap ödenir, fiş basılır", at: 0.8, station: "cashier" },
];

/** sipariş döngüsünün süresi (sn) */
export const ORDER_SECONDS = 26;

export const journeyStepAt = (phase: number) => {
  let i = 0;
  JOURNEY.forEach((s, k) => phase >= s.at && (i = k));
  return i;
};
