import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import "./lib/gsap";
import Layout from "./components/Layout";
import Home from "./pages/Home";

const Blog = lazy(() => import("./pages/Blog"));
const Post = lazy(() => import("./pages/Post"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Legal = lazy(() => import("./pages/Legal"));
const NotFound = lazy(() => import("./pages/NotFound"));

const lazyEl = (El: React.ComponentType) => (
  <Suspense fallback={<div className="min-h-[100svh]" />}>
    <El />
  </Suspense>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* GitHub Pages'te site /sefsqr/ altında: bağlantılar ve sayfa adresleri buna göre */}
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="blog" element={lazyEl(Blog)} />
          <Route path="blog/:slug" element={lazyEl(Post)} />
          <Route path="hakkimizda" element={lazyEl(About)} />
          <Route path="iletisim" element={lazyEl(Contact)} />
          {["gizlilik-politikasi", "cerez-politikasi", "kvkk", "kullanim-kosullari"].map((s) => (
            <Route key={s} path={s} element={lazyEl(Legal)} />
          ))}
          <Route path="*" element={lazyEl(NotFound)} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
