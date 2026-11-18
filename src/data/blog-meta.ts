import meta from "virtual:posts-meta";

/* Yazıların hafif özeti (başlık, kategori, tarih, özet) — ana sayfadaki kartlar bunu kullanır.
   Tam metin (html, sss) yalnızca yazı sayfası açılınca blog.ts ile iner. */
export type PostMeta = (typeof meta)[number];

/* Kapak renkleri orijinal yazılardaki iki rengin yumuşatılmış hâli (beyazla karıştırılır) */
export const soften = (hex: string, k = 0.55) => {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * k);
  const r = mix(n >> 16),
    g = mix((n >> 8) & 255),
    b = mix(n & 255);
  return `rgb(${r} ${g} ${b})`;
};

export const postsMeta: PostMeta[] = meta.map((p) => ({ ...p, colors: [soften(p.colors[0]), soften(p.colors[1], 0.45)] }));
