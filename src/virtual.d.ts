/* vite.config.ts içindeki sanal modül: yazıların tam metni olmadan özetleri */
declare module "virtual:posts-meta" {
  const posts: { slug: string; title: string; category: string; lead: string; date: string; dateLabel: string; readTime: string; colors: [string, string] }[];
  export default posts;
}
