import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/* Ana sayfadaki blog kartları yalnızca başlık/özet ister: yazıların tam metni (html, sss) ana pakete
   girmesin diye "virtual:posts-meta" posts.json'dan bu alanları ayıklayıp verir. Tek kaynak posts.json.
   "virtual:posts-index" aynısına etiketleri ekler: blog listesindeki arama tam metni indirmeden çalışsın. */
function postsMeta(): Plugin {
  const meta = ["slug", "title", "category", "lead", "date", "dateLabel", "readTime", "colors"];
  const fields: Record<string, string[]> = { "virtual:posts-meta": meta, "virtual:posts-index": [...meta, "tags"] };
  const file = fileURLToPath(new URL("./src/data/posts.json", import.meta.url)); // klasör adında boşluk var: %20 değil gerçek yol
  return {
    name: "posts-meta",
    resolveId: (s) => (s in fields ? "\0" + s : undefined),
    load(s) {
      const keep = s.startsWith("\0") ? fields[s.slice(1)] : undefined;
      if (!keep) return;
      this.addWatchFile(file);
      const posts = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>[];
      return `export default ${JSON.stringify(posts.map((p) => Object.fromEntries(keep.map((k) => [k, p[k]]))))};`;
    },
  };
}

/* Yazı tipi CSS'te tanımlı; tarayıcı onu ancak CSS inip ayrıştırılınca fark eder. Açılış perdesi ve 3D sahne
   document.fonts.ready'yi beklediği için Latin alt kümesi (tüm Türkçe metin) HTML'den önceden istenir. */
function preloadFont(): Plugin {
  let base = "/";
  return {
    name: "preload-font",
    apply: "build",
    configResolved: (c) => void (base = c.base),
    transformIndexHtml: {
      order: "post",
      handler(_, ctx) {
        const font = Object.keys(ctx.bundle ?? {}).find((f) => /mona-sans-latin-standard-normal-[^/]+\.woff2$/.test(f));
        if (!font) return;
        return [{ tag: "link", attrs: { rel: "preload", href: base + font, as: "font", type: "font/woff2", crossorigin: "" }, injectTo: "head-prepend" }];
      },
    },
  };
}

export default defineConfig({
  // GitHub Pages siteyi /sefsqr/ altında yayınlar: iş akışı BASE_PATH=/sefsqr/ verir; yerelde kök
  base: process.env.BASE_PATH || "/",
  plugins: [react(), tailwindcss(), postsMeta(), preloadFont()],
  server: { port: 5191 },
  // three ve eklentileri sunucu açılırken bir kez hazırlansın; sonradan "Outdated Optimize Dep" (504) çıkmasın
  optimizeDeps: {
    include: [
      "three",
      "three/examples/jsm/controls/OrbitControls.js",
      "three/examples/jsm/geometries/RoundedBoxGeometry.js",
      "three/examples/jsm/utils/BufferGeometryUtils.js",
      "three/examples/jsm/environments/RoomEnvironment.js",
    ],
  },
  build: {
    target: "es2022",
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes("node_modules/three") ? "three" : id.includes("node_modules/gsap") ? "gsap" : undefined),
      },
    },
  },
});
