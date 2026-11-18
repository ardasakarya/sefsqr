import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/* Ana sayfadaki blog kartları yalnızca başlık/özet ister: yazıların tam metni (html, sss) ana pakete
   girmesin diye "virtual:posts-meta" posts.json'dan bu alanları ayıklayıp verir. Tek kaynak posts.json. */
function postsMeta(): Plugin {
  const id = "virtual:posts-meta";
  const file = fileURLToPath(new URL("./src/data/posts.json", import.meta.url)); // klasör adında boşluk var: %20 değil gerçek yol
  return {
    name: "posts-meta",
    resolveId: (s) => (s === id ? "\0" + id : undefined),
    load(s) {
      if (s !== "\0" + id) return;
      this.addWatchFile(file);
      const posts = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>[];
      const keep = ["slug", "title", "category", "lead", "date", "dateLabel", "readTime", "colors"];
      return `export default ${JSON.stringify(posts.map((p) => Object.fromEntries(keep.map((k) => [k, p[k]]))))};`;
    },
  };
}

export default defineConfig({
  // GitHub Pages siteyi /sefsqr/ altında yayınlar: iş akışı BASE_PATH=/sefsqr/ verir; yerelde kök
  base: process.env.BASE_PATH || "/",
  plugins: [react(), tailwindcss(), postsMeta()],
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
