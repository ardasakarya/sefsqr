import index from "virtual:posts-index";
import { soften } from "./blog-meta";

/* Blog listesi sayfası: özet + etiketler. Tam metin (posts.json ~95 KB) yalnızca yazı açılınca blog.ts ile iner. */
export const postsIndex = index.map((p) => ({ ...p, colors: [soften(p.colors[0]), soften(p.colors[1], 0.45)] as [string, string] }));

export const categories = (() => {
  const m = new Map<string, number>();
  postsIndex.forEach((p) => m.set(p.category, (m.get(p.category) ?? 0) + 1));
  return [...m.entries()].map(([name, count]) => ({ name, count }));
})();
