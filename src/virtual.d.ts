/* vite.config.ts içindeki sanal modüller: yazıların tam metni olmadan özetleri */
type PostSummary = { slug: string; title: string; category: string; lead: string; date: string; dateLabel: string; readTime: string; colors: [string, string] };

declare module "virtual:posts-meta" {
  const posts: PostSummary[];
  export default posts;
}

/* blog listesi: özet + etiketler (arama için) */
declare module "virtual:posts-index" {
  const posts: (PostSummary & { tags: string[] })[];
  export default posts;
}
