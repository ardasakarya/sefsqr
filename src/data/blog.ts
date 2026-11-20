import raw from "./posts.json";
import { soften } from "./blog-meta";

export interface Post {
  slug: string;
  title: string;
  category: string;
  lead: string;
  date: string;
  dateLabel: string;
  updatedLabel: string;
  readTime: string;
  colors: [string, string];
  tags: string[];
  faq: { q: string; a: string }[];
  html: string;
}

export const posts: Post[] = (raw as Post[]).map((p) => ({ ...p, colors: [soften(p.colors[0]), soften(p.colors[1], 0.45)] }));
export const postBySlug = (slug: string) => posts.find((p) => p.slug === slug);

/** Yazının h2 başlıklarından içindekiler listesi */
export const tocOf = (p: Post) =>
  [...p.html.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)].map((m) => ({ id: m[1]!, label: m[2]!.replace(/<[^>]+>/g, "") }));
