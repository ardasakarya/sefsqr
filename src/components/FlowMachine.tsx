import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FLOW, JOURNEY, ORDER_SECONDS, journeyStepAt, type FlowApi, type StationId } from "./flow";

/* ── İş akışı makinesi (3D) ────────────────────────────────────────────────
   Restoranın tek döngüsü bir masa üstü makine olarak. Masa 4'te karekod okutulur → sipariş menüden
   gönderilir → bant üzerinden mutfağa düşer → mutfaktan yemek olarak çıkar → servisten masaya uçar,
   tabakta azalarak yenir → hesap kasaya gider, ödenir, fiş basılır. Diğer masalar (7, 9, 2) ışıklı
   bağlantılarla sisteme bağlıdır; bağlantılardan veri darbeleri akar.

   Etkileşim: sürükleyince döner; istasyona gelince açıklaması çıkar, tıklayınca kamera ona gider.
   "Süreci izle" (startProcess) kamerayı tek siparişin peşine takar. Yakınlaşınca (istasyon/süreç)
   makine ortaya gelir ve hero yazıları çekilir (onZoom). Dar ekranda sade mod: vida, dişli, boru,
   fazladan kart ve etiket çizilmez; gölge çözünürlüğü düşer.

   Temel makine (platform, bant, ışıklar, kamera, birleştirme, temizlik) 21st.dev'deki
   "Agentic Factory" bileşeninden (Eugene Shilow, vibecoding.tech) uyarlandı; istasyonlar,
   ekran çizimleri, masa/yemek akışı, renkler ve metinler SELF'S QR için yeniden yazıldı. */

type Props = {
  className?: string;
  onStation?: (id: StationId) => void;
  onApi?: (api: FlowApi | null) => void;
  onReady?: () => void;
  /** kamera yakınlaştı mı (istasyon ya da süreç) */
  onZoom?: (zoomed: boolean) => void;
  /** süreçteki adım (JOURNEY dizini); süreç bitince null */
  onStep?: (step: number | null) => void;
  /** süreç ilerleme çubuğu: genişliği doğrudan sahne günceller (React yeniden çizmez) */
  progressRef?: RefObject<HTMLElement | null>;
};

export default function FlowMachine({ className = "", progressRef, ...cb }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const handlers = useRef(cb);
  useEffect(() => {
    handlers.current = cb;
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    // ekranlara yazı tuvalde çizilir: önce fontlar yüklensin
    document.fonts.ready.then(() => {
      if (cancelled) return;
      dispose = initScene(root, getComputedStyle(root).fontFamily, {
        onStation: (id) => handlers.current.onStation?.(id),
        onApi: (api) => handlers.current.onApi?.(api),
        onReady: () => handlers.current.onReady?.(),
        onZoom: (z) => handlers.current.onZoom?.(z),
        onStep: (s) => handlers.current.onStep?.(s),
        progress: () => progressRef?.current ?? null,
      });
    });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [progressRef]);

  return (
    <div ref={rootRef} className={`flow-machine ${className}`}>
      <div className="fm-scene" role="img" aria-label="Masa, menü, mutfak, servis ve kasa istasyonlarından oluşan; siparişin masadan mutfağa, yemeğin mutfaktan masaya, hesabın masadan kasaya gittiği etkileşimli 3D akış. Sürükleyerek çevirin, istasyona dokunarak yakından bakın." />
      <div className="fm-labels" />
      <div className="fm-tip" role="tooltip">
        <strong />
        <p />
      </div>
      <div className="fm-loading">
        <i />
        <span>Döngü kuruluyor</span>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────── */

type Opts = {
  onStation: (id: StationId) => void;
  onApi: (api: FlowApi | null) => void;
  onReady: () => void;
  onZoom: (z: boolean) => void;
  onStep: (s: number | null) => void;
  progress: () => HTMLElement | null;
};
type Vec3 = [number, number, number];

function initScene(root: HTMLElement, fontFamily: string, options: Opts): () => void {
  const cleanups: Array<() => void> = [];
  const W = () => root.clientWidth;
  const H = () => root.clientHeight;
  const listen = (target: EventTarget, type: string, handler: (event: never) => void) => {
    const fn = handler as unknown as EventListener;
    target.addEventListener(type, fn);
    cleanups.push(() => target.removeEventListener(type, fn));
  };
  const q = <T extends HTMLElement = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const dispose = () => {
    for (const fn of cleanups.reverse()) fn();
    cleanups.length = 0;
  };

  try {
    const TAU = Math.PI * 2;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { deviceMemory?: number };
    // sade mod: dar ekran ya da zayıf cihaz — süs parçaları çizilmez
    const lite = W() < 700 || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
    const C = { accent: "#6474c8", light: "#9fb0f0", ink: "#1d2030", cream: "#f6f2ec" };
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, Math.max(1, W()) / Math.max(1, H()), 0.1, 150);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) {
      root.classList.add("fm-failed");
      throw e;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio, lite ? 1.5 : 1.75));
    renderer.setSize(Math.max(1, W()), Math.max(1, H()));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    q(".fm-scene").appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = false;
    controls.enableZoom = false; // teker ve parmak sayfayı kaydırır, sahneyi değil
    if (matchMedia("(pointer: coarse)").matches) controls.enableRotate = false;
    controls.minPolarAngle = 0.09;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.rotateSpeed = 0.48;

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    scene.environment = env.texture;
    scene.environmentIntensity = 0.62;
    room.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xdbe2f6, 0x22202a, 2));
    const key = new THREE.DirectionalLight(0xfff3e0, 4.1);
    key.position.set(-4, 12, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(lite ? 1024 : 2048, lite ? 1024 : 2048);
    Object.assign(key.shadow.camera, { left: -10, right: 10, top: 9, bottom: -9, near: 0.5, far: 35 });
    key.shadow.normalBias = 0.035;
    key.shadow.bias = -0.0002;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xb9c6f5, 3.3);
    rim.position.set(3, 7, -8);
    scene.add(rim);
    const warm = new THREE.PointLight(0xffc27a, 22, 20, 2); // restoranın sıcak ışığı
    warm.position.set(-4, 5, 3);
    scene.add(warm);
    const front = new THREE.DirectionalLight(0xffffff, 1);
    front.position.set(5, 3, 10);
    scene.add(front);

    const mat = (color: number, metalness = 0.1, roughness = 0.4, extra: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra });
    const M = {
      body: mat(0x2c3142, 0.72, 0.3),
      base: mat(0x252a3a, 0.82, 0.33),
      edge: mat(0x6d7590, 0.85, 0.24),
      chrome: mat(0xc3cad6, 0.92, 0.18),
      dark: mat(0x12151f, 0.45, 0.38),
      rubber: mat(0x0b0d14, 0.1, 0.6),
      accent: mat(0x6474c8, 0.5, 0.3),
      ivory: mat(0xe6e1d6, 0.4, 0.3),
      china: mat(0xf7f5f0, 0.05, 0.25), // tabak
      copper: mat(0xc9955f, 0.85, 0.3),
      light: mat(0x8f9ff0, 0.2, 0.25, { emissive: 0x8f9ff0, emissiveIntensity: 1.5 }),
      link: mat(0x8f9ff0, 0.1, 0.4, { emissive: 0x8f9ff0, emissiveIntensity: 0.9, transparent: true, opacity: 0.55 }),
      pulse: new THREE.MeshBasicMaterial({ color: 0xdfe5ff, toneMapped: false }),
      green: mat(0xc6d9a1, 0.1, 0.3, { emissive: 0x7ee0a8, emissiveIntensity: 0.8 }),
      food: [mat(0xa4683e, 0.05, 0.7), mat(0x8fae6a, 0.05, 0.7), mat(0xe0a35a, 0.05, 0.6), mat(0xd24f3a, 0.05, 0.6)],
    };
    const geometries = new Map<string, THREE.BufferGeometry>();
    const boxGeo = (w: number, h: number, d: number, r = 0.04) => {
      const k = `b${w},${h},${d},${r}`;
      if (!geometries.has(k)) geometries.set(k, r ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 3, h / 3, d / 3)) : new THREE.BoxGeometry(w, h, d));
      return geometries.get(k)!;
    };
    const box = (p: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, m: THREE.Material = M.body, r = 0.04) => {
      const o = new THREE.Mesh(boxGeo(w, h, d, r), m);
      o.position.set(x, y, z);
      o.castShadow = o.receiveShadow = true;
      p.add(o);
      return o;
    };
    const cyl = (p: THREE.Object3D, r: number, h: number, x: number, y: number, z: number, m: THREE.Material = M.chrome, r2: number = r, seg = 24) => {
      const k = `c${r},${r2},${h},${seg}`;
      if (!geometries.has(k)) geometries.set(k, new THREE.CylinderGeometry(r, r2, h, seg));
      const o = new THREE.Mesh(geometries.get(k)!, m);
      o.position.set(x, y, z);
      o.castShadow = o.receiveShadow = true;
      p.add(o);
      return o;
    };
    const ball = (p: THREE.Object3D, r: number, x: number, y: number, z: number, m: THREE.Material) => {
      const k = `s${r}`;
      if (!geometries.has(k)) geometries.set(k, new THREE.SphereGeometry(r, 14, 10));
      const o = new THREE.Mesh(geometries.get(k)!, m);
      o.position.set(x, y, z);
      o.castShadow = true;
      p.add(o);
      return o;
    };
    const tube = (p: THREE.Object3D, pts: Vec3[], r: number, m: THREE.Material = M.chrome) => {
      const curve = new THREE.CatmullRomCurve3(pts.map((v) => new THREE.Vector3(...v)));
      const o = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(12, pts.length * 7), r, 8, false), m);
      o.castShadow = true;
      p.add(o);
      return o;
    };
    const screw = (p: THREE.Object3D, x: number, y: number, z: number) => {
      if (lite) return;
      cyl(p, 0.055, 0.026, x, y, z, M.chrome, undefined, 12);
      box(p, 0.068, 0.005, 0.009, x, y + 0.014, z, M.dark, 0);
    };
    type Draw = (c: CanvasRenderingContext2D, w: number, h: number) => void;
    const canvasTexture = (w: number, h: number, draw: Draw) => {
      const cv = document.createElement("canvas");
      cv.width = w;
      cv.height = h;
      const ctx = cv.getContext("2d")!;
      draw(ctx, w, h);
      const t = new THREE.CanvasTexture(cv);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      return { texture: t, ctx };
    };
    const print = (c: CanvasRenderingContext2D, txt: string, x: number, y: number, size = 20, color = C.cream, weight = 500) => {
      c.fillStyle = color;
      c.font = `${weight} ${size}px ${fontFamily}`;
      c.fillText(txt, x, y);
    };
    const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, color: string) => {
      c.fillStyle = color;
      c.beginPath();
      c.roundRect(x, y, w, h, r);
      c.fill();
    };
    // karekod: 21x21 modül, üç konum karesi; desen sabit (tohumlu rastgele)
    const drawQR = (c: CanvasRenderingContext2D, x: number, y: number, size: number, fg: string, bg: string) => {
      const n = 21,
        m = size / n;
      c.fillStyle = bg;
      c.fillRect(x - m, y - m, size + 2 * m, size + 2 * m);
      let seed = 7;
      const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
      const finder = (fx: number, fy: number) => fx < 8 && fy < 8;
      c.fillStyle = fg;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const inF = finder(i, j) || finder(n - 1 - i, j) || finder(i, n - 1 - j);
          if (!inF && rnd() > 0.52) c.fillRect(x + i * m, y + j * m, m + 0.4, m + 0.4);
        }
      for (const [fx, fy] of [
        [0, 0],
        [n - 7, 0],
        [0, n - 7],
      ] as const) {
        c.fillStyle = fg;
        c.fillRect(x + fx * m, y + fy * m, 7 * m, 7 * m);
        c.fillStyle = bg;
        c.fillRect(x + (fx + 1) * m, y + (fy + 1) * m, 5 * m, 5 * m);
        c.fillStyle = fg;
        c.fillRect(x + (fx + 2) * m, y + (fy + 2) * m, 3 * m, 3 * m);
      }
    };
    type Painted = { texture: THREE.Texture };
    const screen = (p: THREE.Object3D, w: number, h: number, x: number, y: number, z: number, tex: Painted, both = false) => {
      const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex.texture, toneMapped: false, side: both ? THREE.DoubleSide : THREE.FrontSide }));
      o.position.set(x, y, z);
      p.add(o);
      return o;
    };
    // yemek: tabak + üstünde üç parça; "food" grubu yenirken küçülür
    const makeDish = (p: THREE.Object3D, scale = 1) => {
      const g = new THREE.Group();
      g.scale.setScalar(scale);
      p.add(g);
      cyl(g, 0.3, 0.035, 0, 0, 0, M.china, 0.26, 32);
      const food = new THREE.Group();
      food.position.y = 0.04;
      g.add(food);
      ball(food, 0.09, -0.08, 0.04, 0.02, M.food[0]!).scale.set(1.1, 0.6, 1);
      ball(food, 0.08, 0.09, 0.04, -0.04, M.food[0]!).scale.set(1.1, 0.6, 1);
      ball(food, 0.07, 0.03, 0.03, 0.1, M.food[1]!).scale.set(1.2, 0.5, 1);
      ball(food, 0.035, -0.02, 0.07, -0.08, M.food[3]!);
      return { g, food };
    };

    const machine = new THREE.Group();
    scene.add(machine);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), new THREE.ShadowMaterial({ opacity: 0.28 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.43;
    floor.receiveShadow = true;
    scene.add(floor);

    // platform: katmanlı, pahlı; ön kenarda ışık şeridi
    box(machine, 12.8, 0.38, 8.25, 0, -0.09, 0, M.base, 0.17);
    box(machine, 12.6, 0.055, 8.08, 0, 0.13, 0, M.edge, 0.11);
    box(machine, 12.49, 0.09, 7.96, 0, 0.19, 0, M.body, 0.1);
    box(machine, 11.9, 0.026, 0.032, 0, -0.17, 4.115, M.light, 0.01);
    for (const x of [-5.6, 5.6])
      for (const z of [-3.35, 3.35]) {
        cyl(machine, 0.39, 0.25, x, -0.31, z, M.rubber);
        screw(machine, x, 0.253, z);
      }
    const engraving = canvasTexture(1536, 176, (c, w, h) => {
      c.fillStyle = "#222738";
      c.fillRect(0, 0, w, h);
      c.strokeStyle = "#454d66";
      c.lineWidth = 2;
      c.strokeRect(2, 2, w - 4, h - 4);
      print(c, "SELF'S QR", 45, 79, 40, "#e2e0d8", 650);
      print(c, "·  karekod  →  sipariş  →  mutfak  →  masa  →  kasa", 300, 79, 32, "#b7bdd0", 450);
      print(c, "QR MENÜ SİSTEMİ    /    TÜM MASALAR TEK DÖNGÜDE", 47, 133, 19, "#737c98", 500);
      print(c, "No. 001", 1360, 130, 23, C.light);
    });
    const plate = screen(machine, 7.35, 0.84, -0.4, 0.25, 3.51, engraving);
    plate.rotation.x = -Math.PI / 2;

    // ── istasyonlar (sol→sağ yerleşim; step = akıştaki sırası)
    type Def = { id: StationId; name: string; step: number; pos: Vec3; desc: string };
    type Station = Def & { group: THREE.Group; base: THREE.Vector3; glowMat: THREE.MeshStandardMaterial; label: HTMLDivElement; anchor: THREE.Vector3 };
    const descOf = (id: StationId) => FLOW.find((f) => f.id === id)!.desc;
    const defs: Def[] = [
      { id: "menu", name: "Menü", step: 2, pos: [-4.15, 0.29, -0.65], desc: descOf("menu") },
      { id: "kitchen", name: "Mutfak", step: 3, pos: [-1.65, 0.29, -2.03], desc: descOf("kitchen") },
      { id: "service", name: "Servis", step: 4, pos: [1.5, 0.29, -2.08], desc: descOf("service") },
      { id: "table", name: "Masa 4", step: 1, pos: [4.03, 0.29, 0.12], desc: descOf("table") },
      { id: "cashier", name: "Kasa", step: 5, pos: [0.93, 0.29, 1.85], desc: descOf("cashier") },
    ];
    const stations: Station[] = [];
    const gears: THREE.Group[] = [];
    const gear = (p: THREE.Object3D, x: number, y: number, z: number, r = 0.3) => {
      if (lite) return;
      const g = new THREE.Group();
      g.position.set(x, y, z);
      p.add(g);
      cyl(g, r, 0.09, 0, 0, 0, M.copper);
      cyl(g, r * 0.66, 0.105, 0, 0, 0, M.dark);
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        box(g, r * 0.26, 0.085, r * 0.2, Math.cos(a) * r, 0, Math.sin(a) * r, M.copper, 0.008).rotation.y = -a;
      }
      g.userData.moving = true;
      gears.push(g);
    };
    defs.forEach((d) => {
      const group = new THREE.Group();
      group.position.fromArray(d.pos);
      machine.add(group);
      const glowMat = M.light.clone();
      glowMat.emissiveIntensity = 0.5;
      box(group, 2.05, 0.12, 1.78, 0, 0.03, 0, M.dark, 0.1);
      box(group, 1.97, 0.03, 1.7, 0, 0.12, 0, glowMat, 0.09);
      box(group, 2.03, 0.17, 1.75, 0, 0.215, 0, M.body, 0.1);
      for (const x of [-0.85, 0.85]) for (const z of [-0.7, 0.7]) screw(group, x, 0.311, z);
      gear(group, -0.35, 0.45, 0, 0.27);
      gear(group, 0.22, 0.45, 0.12, 0.21);
      if (!lite) tube(group, [[-0.7, 0.4, -0.4], [-0.55, 0.48, 0.4], [0.35, 0.45, 0.6], [0.7, 0.58, 0.23]], 0.023, M.light);
      const num = String(d.step).padStart(2, "0");
      const plaque = canvasTexture(512, 116, (c, w, h) => {
        c.fillStyle = "#141826";
        c.fillRect(0, 0, w, h);
        print(c, num, 24, 76, 42, C.light, 550);
        print(c, d.name.toLocaleUpperCase("tr"), 111, 73, 35, "#dcdde6", 550);
      });
      screen(group, 1.54, 0.345, 0, 0.27, 0.891, plaque);
      const label = document.createElement("div");
      label.className = "fm-label";
      label.innerHTML = `<div class="fm-card"><span>${num}</span>${d.name}</div><div class="fm-stem"></div>`;
      q(".fm-labels").appendChild(label);
      cleanups.push(() => label.remove());
      stations.push({ ...d, group, base: new THREE.Vector3(...d.pos), glowMat, label, anchor: new THREE.Vector3(0, 2.6, 0) });
    });
    const byId = (id: StationId) => stations.find((s) => s.id === id)!;

    // ── 02 Menü: misafirin telefonu, menü kayar, sepet gönderilir
    const menuSt = byId("menu").group;
    box(menuSt, 1.74, 0.62, 1.33, 0, 0.65, -0.05, M.ivory, 0.13);
    box(menuSt, 1.5, 0.1, 1.16, 0, 0.99, -0.04, M.body, 0.025);
    box(menuSt, 1.2, 0.5, 0.5, 0, 1.25, -0.35, M.body, 0.05); // telefon tutucu
    const phoneTex = canvasTexture(384, 720, () => {});
    const dishes = [
      ["Menemen", "₺140", "#e0a35a"],
      ["Izgara köfte", "₺210", "#a4683e"],
      ["Mercimek çorbası", "₺95", "#d98b3a"],
      ["Sezar salata", "₺160", "#8fae6a"],
      ["Latte", "₺85", "#c7a07a"],
      ["Cheesecake", "₺120", "#e7d3a6"],
    ];
    function drawPhone(t: number, sent: boolean) {
      const c = phoneTex.ctx,
        w = 384,
        h = 720;
      c.fillStyle = C.cream;
      c.fillRect(0, 0, w, h);
      print(c, "Menü", 28, 62, 30, C.ink, 650);
      rr(c, 256, 36, 100, 34, 17, C.accent);
      print(c, "MASA 4", 272, 59, 16, "#fff", 600);
      const cats = ["Kahvaltı", "Ana yemek", "İçecek"];
      const on = Math.floor(t / 2.5) % 3;
      let cx = 28;
      cats.forEach((cat, i) => {
        c.font = `600 16px ${fontFamily}`;
        const tw = c.measureText(cat).width + 26;
        rr(c, cx, 88, tw, 34, 17, i === on ? C.ink : "#e6e1d6");
        print(c, cat, cx + 13, 111, 16, i === on ? "#fff" : "#5a5f73", 600);
        cx += tw + 8;
      });
      const off = ((t * 18) % 96) | 0; // liste yavaşça kayar
      c.save();
      c.beginPath();
      c.rect(0, 136, w, 470);
      c.clip();
      for (let i = 0; i < 7; i++) {
        const d = dishes[(i + Math.floor(t * 0.19)) % dishes.length]!;
        const y = 146 + i * 96 - off;
        rr(c, 20, y, w - 40, 84, 14, "#fff");
        rr(c, 32, y + 12, 60, 60, 12, d[2]!);
        print(c, d[0]!, 108, y + 36, 20, C.ink, 600);
        print(c, d[1]!, 108, y + 64, 18, C.accent, 600);
        rr(c, w - 78, y + 26, 34, 34, 17, i === 1 ? C.accent : "#ece7dc");
        print(c, "+", w - 68, y + 50, 22, i === 1 ? "#fff" : C.ink, 600);
      }
      c.restore();
      rr(c, 20, 622, w - 40, 72, 36, sent ? C.accent : C.ink);
      print(c, sent ? "✓  Sipariş mutfakta" : "Siparişi gönder", sent ? 74 : 94, 666, 21, "#fff", 600);
      if (!sent) print(c, "₺350", 288, 666, 21, C.light, 600);
      phoneTex.texture.needsUpdate = true;
    }
    drawPhone(0, false);
    const phone = new THREE.Group();
    phone.userData.moving = true;
    menuSt.add(phone);
    box(phone, 0.66, 1.2, 0.06, 0, 1.75, -0.2, M.dark, 0.08);
    screen(phone, 0.58, 1.09, 0, 1.75, -0.168, phoneTex);

    // ── 03 Mutfak: sipariş ekranı + ocak, tava, buhar
    const kitchen = byId("kitchen").group;
    box(kitchen, 1.9, 0.66, 1.36, 0, 0.67, -0.04, M.body, 0.11);
    const consoleTop = new THREE.Group();
    consoleTop.position.set(0, 1.01, -0.08);
    consoleTop.rotation.x = -0.32;
    kitchen.add(consoleTop);
    box(consoleTop, 1.76, 0.12, 1.27, 0, 0, 0, M.ivory, 0.04);
    const kds = canvasTexture(640, 340, () => {});
    const orders = [
      ["Masa 4", "Izgara köfte · Latte · Su"],
      ["Masa 7", "Mercimek çorbası"],
      ["Masa 2", "Latte ×3 · Cheesecake"],
    ];
    function drawKitchen(cook: number) {
      const c = kds.ctx;
      c.fillStyle = "#121726";
      c.fillRect(0, 0, 640, 340);
      print(c, "MUTFAK EKRANI", 25, 45, 21, "#b4bcd6", 600);
      print(c, "3 sipariş", 512, 45, 20, C.light, 500);
      for (let i = 0; i < 3; i++) {
        const y = 74 + i * 76;
        rr(c, 21, y, 598, 61, 6, "#1f2638");
        c.fillStyle = i === 0 ? C.light : "#5d6788";
        c.fillRect(34, y + 10, 8, 41);
        print(c, orders[i]![0]!, 56, y + 29, 19, "#e3e5ee", 650);
        print(c, orders[i]![1]!, 56, y + 50, 13, "#8e97b4");
        const done = i === 0 && cook >= 1;
        print(c, i === 0 ? (done ? "HAZIR ✓" : "HAZIRLANIYOR") : "SIRADA", 470, y + 25, 12, i === 0 ? C.light : "#7d86a3", 600);
        c.fillStyle = "#2f3850";
        c.fillRect(470, y + 36, 128, 7);
        c.fillStyle = i === 0 ? C.light : "#5d6788";
        c.fillRect(470, y + 36, i === 0 ? Math.min(1, cook) * 128 : 20 + i * 14, 7);
      }
      kds.texture.needsUpdate = true;
    }
    drawKitchen(0);
    const ks = screen(consoleTop, 1.53, 0.79, 0, 0.067, -0.17, kds);
    ks.rotation.x = -Math.PI / 2;
    for (const x of [-0.5, 0.5]) {
      cyl(consoleTop, 0.2, 0.03, x, 0.08, 0.42, M.dark);
      cyl(consoleTop, 0.13, 0.02, x, 0.1, 0.42, M.copper);
    }
    const pan = new THREE.Group();
    pan.userData.moving = true;
    pan.position.set(-0.5, 0.17, 0.42);
    consoleTop.add(pan);
    cyl(pan, 0.2, 0.08, 0, 0, 0, M.dark, 0.17);
    box(pan, 0.36, 0.04, 0.06, 0.34, 0.02, 0, M.dark, 0.02);
    const steamMat = new THREE.MeshBasicMaterial({ color: 0xdfe5f7, transparent: true, opacity: 0.25, depthWrite: false });
    const steam: THREE.Mesh[] = [];
    for (let i = 0; i < (lite ? 2 : 4); i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), steamMat.clone());
      s.userData.moving = true;
      s.userData.i = i;
      consoleTop.add(s);
      steam.push(s);
    }
    cyl(kitchen, 0.075, 0.06, 0.77, 1.05, -0.62, M.green);

    // ── 04 Servis: garson paneli
    const service = byId("service").group;
    box(service, 1.35, 0.18, 0.88, 0, 0.44, 0, M.ivory, 0.045);
    cyl(service, 0.095, 1.04, 0, 0.93, -0.31, M.chrome);
    box(service, 0.56, 0.91, 0.14, 0, 0.99, -0.34, M.body, 0.04);
    box(service, 2.42, 1.72, 0.2, 0, 1.94, -0.17, M.ivory, 0.08);
    box(service, 2.28, 1.59, 0.1, 0, 1.94, -0.044, M.dark, 0.045);
    const panelTex = canvasTexture(896, 592, () => {});
    function drawPanel(ready: boolean) {
      const c = panelTex.ctx,
        w = 896,
        h = 592;
      c.fillStyle = "#eeebe3";
      c.fillRect(0, 0, w, h);
      c.fillStyle = "#e2ded3";
      c.fillRect(0, 0, w, 64);
      print(c, "GARSON PANELİ", 33, 42, 22, C.ink, 700);
      print(c, "Bugün · 42 servis", 650, 42, 16, "#6b7088");
      const rows = [
        ["4", ready ? "Masa 4 · Yemek hazır — servise çık" : "Masa 4 · Mutfakta hazırlanıyor", ready],
        ["9", "Masa 9 · Garson çağırıyor", false],
        ["2", "Masa 2 · Hesap istendi", false],
        ["7", "Masa 7 · Yeni sipariş · 1 ürün", false],
      ] as const;
      rows.forEach(([n, txt, hot], i) => {
        const y = 92 + i * 118;
        rr(c, 32, y, w - 64, 100, 14, hot ? C.accent : "#fff");
        if (!hot) {
          c.strokeStyle = "#dcd7cb";
          c.lineWidth = 2;
          c.beginPath();
          c.roundRect(32, y, w - 64, 100, 14);
          c.stroke();
        }
        rr(c, 56, y + 24, 52, 52, 26, hot ? "rgba(255,255,255,.18)" : "#eef0fa");
        print(c, n, 74, y + 59, 22, hot ? "#fff" : C.accent, 700);
        print(c, txt.split(" · ")[0]!, 132, y + 45, 26, hot ? "#fff" : C.ink, 650);
        print(c, txt.split(" · ")[1]!, 132, y + 77, 19, hot ? "rgba(255,255,255,.88)" : "#6b7088");
      });
      panelTex.texture.needsUpdate = true;
    }
    drawPanel(false);
    screen(service, 2.16, 1.43, 0, 1.95, 0.011, panelTex);
    box(service, 0.21, 0.019, 0.008, 0, 1.149, 0.013, M.light, 0.003);
    // servis tezgâhı (yemeğin kalktığı yer)
    box(service, 0.9, 0.08, 0.6, 0.85, 0.4, 0.45, M.ivory, 0.03);

    // ── 01 Masa 4: gerçek masa — yuvarlak tabla, karekod standı, tabak yeri
    const table = byId("table").group;
    cyl(table, 0.95, 0.08, 0, 0.46, 0.05, M.ivory, 0.95, 40);
    cyl(table, 0.1, 0.14, 0, 0.36, 0.05, M.chrome);
    box(table, 1.1, 1.3, 0.12, -0.3, 1.15, -0.55, M.body, 0.08); // karekod standı
    box(table, 1.02, 1.22, 0.05, -0.3, 1.15, -0.48, M.dark, 0.04);
    const qrTex = canvasTexture(420, 480, (c, w, h) => {
      c.fillStyle = C.cream;
      c.fillRect(0, 0, w, h);
      print(c, "MASA 4", 30, 54, 30, C.ink, 700);
      print(c, "Okut · menüyü gör", 30, 86, 17, "#6b7088", 500);
      drawQR(c, 95, 120, 230, C.ink, "#fff");
      rr(c, 30, 400, w - 60, 50, 25, C.accent);
      print(c, "selfsqr.com", 145, 432, 19, "#fff", 600);
    });
    screen(table, 0.96, 1.1, -0.3, 1.15, -0.45, qrTex);
    const scanPhone = new THREE.Group();
    scanPhone.userData.moving = true;
    table.add(scanPhone);
    box(scanPhone, 0.3, 0.56, 0.035, 0, 0, 0, M.dark, 0.05);
    const scanBeam = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.012), new THREE.MeshBasicMaterial({ color: 0x9fb0f0, toneMapped: false, transparent: true, opacity: 0.9 }));
    scanBeam.position.z = 0.02;
    scanPhone.add(scanBeam);
    const incoming = new THREE.Group();
    incoming.userData.moving = true;
    table.add(incoming);
    box(incoming, 0.86, 0.42, 0.043, 0, 0, 0, M.light, 0.035);
    const noteTex = canvasTexture(432, 204, (c) => {
      c.fillStyle = C.light;
      c.fillRect(0, 0, 432, 204);
      rr(c, 24, 64, 64, 64, 14, C.ink);
      drawQR(c, 32, 72, 48, C.cream, C.ink);
      print(c, "Masa 4", 108, 91, 38, C.ink, 650);
      print(c, "Karekod okutuldu", 108, 138, 23, "#2f3760", 500);
    });
    screen(incoming, 0.82, 0.39, 0, 0, 0.026, noteTex);
    const tablePlateSpot = new THREE.Vector3(0.28, 0.52, 0.35); // masadaki tabak yeri (masa grubunda)

    // ── 05 Kasa: ödeme ekranı, fiş, düşen ₺
    const cashier = byId("cashier").group;
    box(cashier, 1.91, 0.63, 1.32, 0, 0.65, -0.06, M.ivory, 0.12);
    box(cashier, 1.96, 0.19, 1.38, 0, 0.42, -0.04, M.body, 0.04);
    box(cashier, 1.02, 0.25, 0.91, -0.33, 1.04, -0.03, M.body, 0.045);
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) box(cashier, 0.19, 0.085, 0.17, -0.62 + col * 0.27, 1.21, 0.27 - row * 0.24, col === 2 && row === 2 ? M.accent : M.ivory, 0.022);
    box(cashier, 0.64, 0.6, 0.52, 0.58, 1.04, -0.15, M.body, 0.045);
    box(cashier, 0.48, 0.07, 0.09, 0.59, 1.37, -0.1, M.dark, 0.01);
    cyl(cashier, 0.06, 0.65, -0.35, 1.6, -0.56, M.chrome);
    box(cashier, 1.13, 0.46, 0.19, -0.35, 1.98, -0.56, M.body, 0.045);
    const cashTex = canvasTexture(512, 176, () => {});
    function drawCash(paid: boolean) {
      const c = cashTex.ctx;
      c.fillStyle = "#121a2b";
      c.fillRect(0, 0, 512, 176);
      print(c, paid ? "ÖDEME ALINDI · MASA 4" : "HESAP BEKLENİYOR · MASA 4", 22, 44, 22, "#9fb0f0", 600);
      print(c, paid ? "+₺350" : "₺350", 26, 131, 66, paid ? "#eef0fa" : "#7d86a3", 550);
      cashTex.texture.needsUpdate = true;
    }
    drawCash(false);
    screen(cashier, 1.015, 0.349, -0.35, 1.98, -0.459, cashTex);
    const receipt = new THREE.Group();
    receipt.position.set(0.59, 1.37, -0.1);
    receipt.userData.moving = true;
    cashier.add(receipt);
    const receiptTex = canvasTexture(280, 540, (c, w, h) => {
      c.fillStyle = C.cream;
      c.fillRect(0, 0, w, h);
      print(c, "SELF'S QR", 25, 52, 24, C.ink, 700);
      print(c, "ADİSYON · MASA 4", 25, 86, 17, "#5b6178", 600);
      c.strokeStyle = "#9096aa";
      c.setLineDash([5, 6]);
      c.beginPath();
      c.moveTo(22, 112);
      c.lineTo(258, 112);
      c.stroke();
      [
        ["Izgara köfte", "₺210"],
        ["Latte", "₺85"],
        ["Su", "₺55"],
      ].forEach(([a, b], i) => {
        print(c, a!, 25, 148 + i * 30, 18, C.ink);
        print(c, b!, 200, 148 + i * 30, 18, C.ink);
      });
      print(c, "TOPLAM", 25, 262, 22, C.ink, 700);
      print(c, "₺350", 188, 262, 22, C.ink, 700);
      print(c, "ÖDENDİ", 25, 312, 28, C.accent, 700);
      for (let i = 0; i < 44; i++) {
        c.fillStyle = C.ink;
        c.fillRect(25 + i * 5, 350, 1 + (i % 3), 80);
      }
      print(c, "Afiyet olsun!", 25, 480, 20, "#5b6178", 500);
    });
    screen(receipt, 0.41, 0.83, 0, 0.415, 0.01, receiptTex, true);
    receipt.rotation.x = -0.16;
    const coin = new THREE.Group();
    coin.userData.moving = true;
    cashier.add(coin);
    cyl(coin, 0.22, 0.065, 0, 0, 0, M.accent, undefined, 32).rotation.x = Math.PI / 2;
    const liraTex = canvasTexture(128, 128, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      c.textAlign = "center";
      print(c, "₺", 64, 95, 84, "#eef0fa", 650);
    });
    const lira = screen(coin, 0.28, 0.28, 0, 0, 0.04, liraTex);
    (lira.material as THREE.MeshBasicMaterial).transparent = true;
    cyl(cashier, 0.33, 0.09, 1.04, 0.39, 0.55, M.dark);

    // ── diğer masalar: sisteme ışıklı bağlantıyla bağlı (masa 7, 9, 2)
    const hub = byId("table").base.clone().add(new THREE.Vector3(0, 0.25, 0));
    const tables: { pos: THREE.Vector3; n: string }[] = [
      { pos: new THREE.Vector3(4.75, 0.29, -2.75), n: "7" },
      { pos: new THREE.Vector3(4.85, 0.29, 2.95), n: "9" },
      ...(lite ? [] : [{ pos: new THREE.Vector3(-4.95, 0.29, 2.8), n: "2" }]),
    ];
    const links: { curve: THREE.CatmullRomCurve3; dots: THREE.Mesh[] }[] = [];
    tables.forEach(({ pos, n }, i) => {
      const g = new THREE.Group();
      g.position.copy(pos);
      machine.add(g);
      cyl(g, 0.68, 0.05, 0, 0.0, 0, M.dark, 0.68, 32);
      cyl(g, 0.6, 0.02, 0, 0.035, 0, M.light, 0.6, 32);
      cyl(g, 0.07, 0.42, 0, 0.25, 0, M.chrome);
      cyl(g, 0.6, 0.06, 0, 0.48, 0, M.ivory, 0.6, 32);
      // küçük karekod kartı
      const tag = canvasTexture(160, 200, (c, w, h) => {
        c.fillStyle = C.cream;
        c.fillRect(0, 0, w, h);
        print(c, "MASA " + n, 16, 32, 22, C.ink, 700);
        drawQR(c, 32, 52, 96, C.ink, "#fff");
      });
      box(g, 0.34, 0.42, 0.04, -0.2, 0.74, -0.25, M.body, 0.02);
      screen(g, 0.3, 0.38, -0.2, 0.74, -0.228, tag);
      makeDish(g, 0.75).g.position.set(0.18, 0.52, 0.1); // masada yenen yemek
      // bağlantı: masadan ana masaya kavisli ışık
      const a = pos.clone().add(new THREE.Vector3(0, 0.25, 0));
      const mid = a.clone().lerp(hub, 0.5).add(new THREE.Vector3(0, 0.55, 0));
      const curve = new THREE.CatmullRomCurve3([a, mid, hub]);
      machine.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.018, 6, false), M.link));
      const dots: THREE.Mesh[] = [];
      for (let k = 0; k < (lite ? 1 : 2); k++) {
        const d = ball(machine, 0.05, 0, 0, 0, M.pulse);
        d.userData.moving = true;
        d.userData.off = k * 0.5 + i * 0.17;
        dots.push(d);
      }
      links.push({ curve, dots });
    });

    // ── bant: kapalı eğri, kayan basamaklar, raylar
    const path = new THREE.CatmullRomCurve3(
      (
        [
          [-3.95, 0.84, 0.65],
          [-3.1, 0.84, -0.12],
          [-1.45, 0.84, -0.79],
          [1.32, 0.84, -0.8],
          [3.3, 0.84, 0.19],
          [3.43, 0.84, 1.21],
          [1.35, 0.84, 2.7],
          [-1.4, 0.84, 2.52],
          [-3.54, 0.84, 1.65],
        ] as Vec3[]
      ).map((p) => new THREE.Vector3(...p)),
      true,
      "catmullrom",
      0.25,
    );
    const belt = new THREE.Group();
    machine.add(belt);
    const frameMesh = new THREE.Mesh(new THREE.TubeGeometry(path, 150, 0.35, 8, true), M.dark);
    frameMesh.scale.y = 0.3;
    frameMesh.position.y = 0.51;
    belt.add(frameMesh);
    const beltCount = lite ? 96 : 148;
    const slats = new THREE.InstancedMesh(boxGeo(0.135, 0.065, 0.63, 0.012), M.body, beltCount);
    slats.receiveShadow = true;
    slats.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    belt.add(slats);
    const dummy = new THREE.Object3D(),
      pV = new THREE.Vector3(),
      tV = new THREE.Vector3();
    const updateBelt = (t: number) => {
      for (let i = 0; i < beltCount; i++) {
        const u = (i / beltCount + t * 0.012) % 1;
        path.getPointAt(u, pV);
        path.getTangentAt(u, tV);
        dummy.position.copy(pV);
        dummy.rotation.set(0, -Math.atan2(tV.z, tV.x), 0);
        dummy.updateMatrix();
        slats.setMatrixAt(i, dummy.matrix);
      }
      slats.instanceMatrix.needsUpdate = true;
    };
    updateBelt(0);
    for (const side of [-1, 1]) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 160; i++) {
        path.getPointAt(i / 160, pV);
        path.getTangentAt(i / 160, tV);
        pts.push(pV.clone().add(new THREE.Vector3(-tV.z * 0.36 * side, 0.09, tV.x * 0.36 * side)));
      }
      belt.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.028, 6, false), M.chrome));
    }
    if (!lite) {
      for (let i = 0; i < 16; i++) {
        const p = path.getPointAt(i / 16);
        cyl(belt, 0.045, 0.43, p.x, 0.53, p.z, M.chrome);
      }
      for (let i = 0; i < 4; i++) {
        const a = stations[i]!.base,
          b = stations[i + 1]!.base;
        const curve = new THREE.CatmullRomCurve3([a.clone().add(new THREE.Vector3(0.4, 0.12, 0)), a.clone().lerp(b, 0.35).add(new THREE.Vector3(0, 0.1, -0.6)), a.clone().lerp(b, 0.65).add(new THREE.Vector3(0, 0.1, -0.6)), b.clone().add(new THREE.Vector3(-0.4, 0.12, 0))]);
        machine.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.054, 8, false), M.copper));
      }
    }

    // ── tek siparişin nesneleri: kart (karekod → sipariş → mutfak fişi), yemek, hesap
    const qrCardTex = canvasTexture(256, 352, (c, w, h) => {
      c.fillStyle = C.cream;
      c.fillRect(0, 0, w, h);
      print(c, "MASA 4", 22, 46, 24, C.ink, 700);
      drawQR(c, 40, 78, 176, C.ink, "#fff");
      print(c, "okutuldu ✓", 22, 324, 18, C.accent, 600);
    });
    const orderTex = canvasTexture(256, 352, (c) => {
      c.fillStyle = C.light;
      c.fillRect(0, 0, 256, 352);
      print(c, "SİPARİŞ", 21, 48, 26, C.ink, 700);
      print(c, "Masa 4 · 3 ürün", 21, 80, 17, "#2f3760", 600);
      c.strokeStyle = "#4b5590";
      c.lineWidth = 2;
      c.strokeRect(21, 106, 214, 150);
      ["Izgara köfte", "Latte", "Su"].forEach((s, i) => print(c, "• " + s, 36, 146 + i * 36, 19, C.ink, 500));
      print(c, "₺350", 21, 318, 26, C.ink, 700);
    });
    const ticketTex = canvasTexture(256, 352, (c) => {
      c.fillStyle = "#1b2133";
      c.fillRect(0, 0, 256, 352);
      print(c, "MUTFAK", 21, 46, 22, C.light, 700);
      print(c, "Masa 4", 21, 84, 30, "#fff", 700);
      ["Izgara köfte", "Latte", "Su"].forEach((s, i) => print(c, "☐ " + s, 22, 140 + i * 40, 20, "#c8cee4", 500));
      print(c, "hazırlanıyor…", 21, 318, 18, C.light, 500);
    });
    const order = new THREE.Group();
    order.userData.moving = true;
    machine.add(order);
    box(order, 0.47, 0.71, 0.04, 0, 0, 0, M.ivory, 0.022);
    const faces = [qrCardTex, orderTex, ticketTex].map((tex) => {
      const s = screen(order, 0.43, 0.665, 0, 0, 0.024, tex, true);
      s.visible = false;
      return s;
    });
    const dish = makeDish(machine, 1.15);
    dish.g.userData.moving = true;
    // cloche (servis kapağı): yemek masaya giderken üstünde
    const cloche = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 12, 0, TAU, 0, Math.PI / 2), M.chrome);
    cloche.userData.moving = true;
    dish.g.add(cloche);
    const bill = new THREE.Group();
    bill.userData.moving = true;
    machine.add(bill);
    box(bill, 0.47, 0.71, 0.04, 0, 0, 0, M.ivory, 0.022);
    screen(bill, 0.43, 0.665, 0, 0, 0.024, receiptTex, true);

    // bant üstünde dolaşan diğer siparişler (yalnızca geniş ekranda; sade modda kalabalık yapmasın)
    const ambient: THREE.Group[] = [];
    if (!lite)
      for (let i = 0; i < 2; i++) {
        const g = new THREE.Group();
        g.userData.moving = true;
        machine.add(g);
        box(g, 0.4, 0.6, 0.035, 0, 0, 0, M.ivory, 0.02);
        screen(g, 0.37, 0.56, 0, 0, 0.02, i ? ticketTex : orderTex, true);
        g.scale.setScalar(0.8);
        ambient.push(g);
      }

    const nearestPort = (x: number, z: number) => {
      let best = 0,
        dist = Infinity;
      for (let i = 0; i < 300; i++) {
        const p = path.getPointAt(i / 300),
          d = (p.x - x) ** 2 + (p.z - z) ** 2;
        if (d < dist) {
          dist = d;
          best = i / 300;
        }
      }
      return best;
    };
    const menuU = nearestPort(-3.4, -0.2),
      kitchenU = nearestPort(-1.65, -0.7),
      serviceU = nearestPort(1.5, -0.7),
      cashU = nearestPort(0.93, 2.65);

    // durağan geometriyi malzemeye göre birleştir (çizim çağrısı azalır); hareketliler ayrı kalır
    const compact = (group: THREE.Object3D) => {
      for (const child of [...group.children]) if ((child as THREE.Group).isGroup && !child.userData.moving) compact(child);
      const buckets = new Map<string, THREE.Mesh[]>();
      for (const o of group.children) {
        const m = o as THREE.Mesh & { isInstancedMesh?: boolean };
        if (!m.isMesh || m.isInstancedMesh || m.userData.moving || Array.isArray(m.material)) continue;
        const k = (m.material as THREE.Material).uuid;
        if (!buckets.has(k)) buckets.set(k, []);
        buckets.get(k)!.push(m);
      }
      for (const list of buckets.values()) {
        if (list.length < 2) continue;
        const geos = list.map((m) => {
          m.updateMatrix();
          const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
          return g.applyMatrix4(m.matrix);
        });
        const merged = mergeGeometries(geos, false);
        geos.forEach((g) => g.dispose());
        if (!merged) continue;
        const mesh = new THREE.Mesh(merged, list[0]!.material);
        mesh.castShadow = list.some((x) => x.castShadow);
        mesh.receiveShadow = list.some((x) => x.receiveShadow);
        list.forEach((m) => group.remove(m));
        group.add(mesh);
      }
    };
    compact(machine);
    stations.forEach((s) => s.group.traverse((o) => (o.userData.station = s.id)));
    const pickables = stations.map((s) => s.group);

    // ── kamera
    type CamMode = "overview" | "station" | "follow";
    let cameraMode: CamMode = "overview",
      selected: StationId = "table",
      hovered: StationId | null = null,
      simTime = 0,
      orderStart = 0,
      processing = false,
      width = W(),
      height = H(),
      wide = width >= 1024,
      lastInteraction = performance.now(),
      dragging = false,
      wasDragged = false,
      downX = 0,
      downY = 0,
      cameraAnimating = true,
      visible = true,
      sized = false,
      readySent = false,
      baseDistance = 25,
      offX = 0,
      offY = 0,
      lastStep = -1,
      zoomSent = false;
    const desiredPos = new THREE.Vector3(),
      desiredTarget = new THREE.Vector3(0, 1, 0),
      viewDir = new THREE.Vector3(9, 8.4, 17).normalize(), // biraz alçak açı: ekranlar daha önden görünür
      follow = new THREE.Vector3();
    /* kadraj kaydırma: genel görünümde makine yazıların yanına/altına yerleşir; yakınlaşınca ortaya gelir */
    const offTarget = () => {
      const zoomed = cameraMode !== "overview";
      return wide ? [zoomed ? 0 : -width * 0.17, zoomed ? 0 : height * 0.09] : [0, zoomed ? 0 : -height * 0.07];
    };
    const near = () => (wide ? 9.5 : 8.6);
    const setGoal = () => {
      if (cameraMode === "station") {
        desiredTarget.copy(byId(selected).group.position).add(new THREE.Vector3(0, 1.2, 0));
        desiredPos.copy(desiredTarget).addScaledVector(viewDir, near());
      } else if (cameraMode === "follow") {
        desiredTarget.copy(follow);
        desiredPos.copy(desiredTarget).addScaledVector(viewDir, near() * 1.05);
      } else {
        desiredTarget.set(0, 1, 0);
        desiredPos.copy(viewDir).multiplyScalar(baseDistance).add(desiredTarget);
      }
    };
    const applyOffset = () => camera.setViewOffset(width, height, offX, offY, width, height);
    const layout = () => {
      if (!W() || !H()) return; // görünmez kutuda (0 boy) kamera bozulmasın
      const first = !sized;
      sized = true;
      width = W();
      height = H();
      wide = width >= 1024;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      const fov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 2;
      // şeklin tamamı kadraja sığar, kesilmez (geniş: sağ %62'lik alan; dar: tam genişlik, alt bant)
      const availW = wide ? 0.62 : 0.94;
      const availH = wide ? 0.7 : 0.3;
      baseDistance = Math.max(15.5 / (fov * camera.aspect * availW), 10.5 / (fov * availH));
      [offX, offY] = offTarget();
      applyOffset();
      setGoal();
      cameraAnimating = true;
      if (first) {
        camera.position.copy(desiredPos);
        controls.target.copy(desiredTarget);
        controls.update();
        cameraAnimating = false;
      }
    };
    const setZoom = () => {
      const z = cameraMode !== "overview";
      if (z !== zoomSent) {
        zoomSent = z;
        options.onZoom(z);
      }
    };
    const focusStation = (id: StationId) => {
      if (processing) stopProcess(false);
      selected = id;
      cameraMode = "station";
      lastInteraction = performance.now();
      setGoal();
      cameraAnimating = true;
      setZoom();
    };
    const overview = () => {
      if (processing) stopProcess(false);
      cameraMode = "overview";
      lastInteraction = performance.now();
      setGoal();
      cameraAnimating = true;
      setZoom();
    };
    const startProcess = () => {
      processing = true;
      orderStart = simTime; // sipariş döngüsü baştan
      lastStep = -1;
      cameraMode = "follow";
      lastInteraction = performance.now();
      cameraAnimating = true;
      setZoom();
    };
    function stopProcess(toOverview = true) {
      processing = false;
      options.onStep(null);
      const bar = options.progress();
      if (bar) bar.style.transform = "scaleX(0)";
      if (toOverview) {
        cameraMode = "overview";
        setGoal();
        cameraAnimating = true;
        setZoom();
      }
    }
    options.onApi({ focusStation, overview, startProcess, stopProcess: () => stopProcess(true) });
    cleanups.push(() => options.onApi(null));
    layout();
    const ro = new ResizeObserver(() => layout());
    ro.observe(root);
    cleanups.push(() => ro.disconnect());
    controls.addEventListener("start", () => {
      dragging = true;
      cameraAnimating = false;
      lastInteraction = performance.now();
    });
    controls.addEventListener("end", () => {
      dragging = false;
      lastInteraction = performance.now();
    });

    // ── fareyle istasyon seçimi + ipucu kutusu
    const raycaster = new THREE.Raycaster(),
      pointer = new THREE.Vector2(),
      tip = q(".fm-tip");
    const local = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top] as const;
    };
    const hit = (x: number, y: number) => {
      pointer.set((x / width) * 2 - 1, (-y / height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickables, true);
      return hits.length ? (stations.find((s) => s.id === hits[0]!.object.userData.station) ?? null) : null;
    };
    listen(renderer.domElement, "pointermove", (e: PointerEvent) => {
      const [x, y] = local(e);
      if (Math.hypot(x - downX, y - downY) > 5) wasDragged = true;
      if (dragging) return;
      const s = hit(x, y);
      hovered = s ? s.id : null;
      renderer.domElement.style.cursor = s ? "pointer" : "grab";
      tip.classList.toggle("on", !!s);
      if (s) {
        tip.querySelector("strong")!.innerHTML = `<span>${String(s.step).padStart(2, "0")}</span>${s.name}`;
        tip.querySelector("p")!.textContent = s.desc;
        tip.style.left = Math.min(width - 235, Math.max(8, x + 16)) + "px";
        tip.style.top = Math.max(8, Math.min(height - 95, y - 70)) + "px";
      }
    });
    listen(renderer.domElement, "pointerleave", () => {
      hovered = null;
      tip.classList.remove("on");
    });
    listen(renderer.domElement, "pointerdown", (e: PointerEvent) => {
      [downX, downY] = local(e);
      wasDragged = false;
      tip.classList.remove("on");
    });
    listen(renderer.domElement, "pointerup", (e: PointerEvent) => {
      if (wasDragged) return;
      const s = hit(...local(e));
      if (!s) return;
      focusStation(s.id);
      options.onStation(s.id);
    });
    let lastFrame = performance.now();
    listen(document, "visibilitychange", () => {
      visible = !document.hidden;
      lastFrame = performance.now();
    });
    const io = new IntersectionObserver(
      (en) => {
        visible = en[0]!.isIntersecting && !document.hidden;
        lastFrame = performance.now();
      },
      { threshold: 0.01 },
    );
    io.observe(renderer.domElement);
    cleanups.push(() => io.disconnect());

    // ── sipariş senaryosu: döngü içindeki konumdan nesnelerin yeri
    const at = (s: StationId, x: number, y: number, z: number) => byId(s).group.position.clone().add(new THREE.Vector3(x, y, z));
    const arc = (out: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3, f: number, lift = 1.6) => out.copy(a).lerp(b, f).setY(a.y + (b.y - a.y) * f + Math.sin(f * Math.PI) * lift);
    const seg = (p: number, a: number, b: number) => THREE.MathUtils.clamp((p - a) / (b - a), 0, 1);
    const ease = (f: number) => f * f * (3 - 2 * f);
    const tableWorld = () => byId("table").group.localToWorld(tablePlateSpot.clone());
    const tmp = new THREE.Vector3();
    let phoneSent = false,
      kitchenCook = -1,
      panelReady = false,
      cashPaid = false;
    const runOrder = (p: number, t: number) => {
      // 0 – 0.14  karekod okutulur, kart masadan menüye uçar
      // 0.14–0.22 kart menüde (sipariş), 0.22–0.32 bantla mutfağa, 0.32–0.42 mutfakta pişer
      // 0.42–0.5  yemek bantla servise, 0.5–0.56 serviste, 0.56–0.64 masaya uçar
      // 0.64–0.8  masada yenir, 0.8–0.9 hesap kasaya uçar, 0.9–1 ödenir
      const reach = p < 0.08 ? Math.sin(seg(p, 0, 0.08) * Math.PI) : 0;
      scanPhone.position.set(0.5 - reach * 0.2, 1.1 + reach * 0.12, 0.35 - reach * 0.25);
      scanPhone.rotation.set(-0.15, -0.35, 0.1);
      scanBeam.position.y = Math.sin(t * 6) * 0.22;
      (scanBeam.material as THREE.MeshBasicMaterial).opacity = reach > 0.4 ? 0.95 : 0.12;
      const nf = seg(p, 0.02, 0.11);
      incoming.visible = nf > 0 && nf < 1;
      incoming.position.set(Math.sin(nf * Math.PI) * 0.24, 2.6 - nf * 0.9, 0.6 - nf * 0.3);
      incoming.scale.setScalar(Math.min(1, nf * 8 + 0.15, (1 - nf) * 7 + 0.1));

      // kart
      order.visible = p >= 0.06 && p < 0.42;
      let face = 0;
      if (p < 0.14) {
        arc(order.position, at("table", -0.3, 1.9, 0.2), at("menu", 0, 1.5, 0.7), ease(seg(p, 0.06, 0.14)), 1.8);
        order.rotation.set(0, Math.sin(seg(p, 0.06, 0.14) * Math.PI) * 0.3, 0);
      } else if (p < 0.22) {
        face = 1;
        order.position.copy(at("menu", 0, 1.5 + Math.sin(t * 2) * 0.04, 0.7));
        order.rotation.set(0, 0.18, 0);
      } else if (p < 0.32) {
        face = 1;
        path.getPointAt(menuU + (kitchenU - menuU) * seg(p, 0.22, 0.32), order.position);
        order.position.y += 0.43;
        order.rotation.set(0, 0.18, 0);
      } else {
        face = 2;
        order.position.copy(at("kitchen", 0.15, 1.75 + Math.sin(t * 2) * 0.04, 0.75));
        order.rotation.set(0, 0.1, 0);
      }
      faces.forEach((f, i) => (f.visible = i === face));

      // yemek
      const dishOn = p >= 0.42 && p < 0.83;
      dish.g.visible = dishOn;
      cloche.visible = p < 0.64;
      if (dishOn) {
        if (p < 0.5) {
          path.getPointAt(kitchenU + (serviceU - kitchenU) * seg(p, 0.42, 0.5), dish.g.position);
          dish.g.position.y += 0.45;
        } else if (p < 0.56) {
          tmp.copy(at("service", 0.85, 0.5, 0.45));
          dish.g.position.copy(tmp).setY(tmp.y + ease(seg(p, 0.5, 0.56)) * 0.6);
        } else if (p < 0.64) {
          arc(dish.g.position, at("service", 0.85, 1.1, 0.45), tableWorld(), ease(seg(p, 0.56, 0.64)), 1.4);
        } else dish.g.position.copy(tableWorld());
        // yenir: tabaktaki yemek azalır, sonra tabak kalkar
        const eat = seg(p, 0.66, 0.79);
        dish.food.scale.setScalar(Math.max(0.05, 1 - eat * 0.95));
        dish.g.scale.setScalar(1.15 * (p > 0.8 ? Math.max(0.01, 1 - seg(p, 0.8, 0.83)) : 1));
      }

      // hesap
      bill.visible = p >= 0.8 && p < 0.99;
      if (bill.visible) {
        if (p < 0.9) arc(bill.position, tableWorld().add(new THREE.Vector3(0, 0.3, 0)), at("cashier", 0.2, 1.7, 0.6), ease(seg(p, 0.8, 0.9)), 1.6);
        else bill.position.copy(at("cashier", 0.2, 1.7 + Math.sin(t * 2) * 0.04, 0.6));
        bill.rotation.set(0, 0.2, 0);
        bill.scale.setScalar(p > 0.96 ? Math.max(0.05, (0.99 - p) / 0.03) : 1);
      }

      // istasyon ekranları siparişe göre
      const sent = p >= 0.14 && p < 0.5;
      if (sent !== phoneSent) {
        phoneSent = sent;
        drawPhone(t, sent);
      }
      const cook = p < 0.32 ? 0 : seg(p, 0.32, 0.42);
      if (Math.abs(cook - kitchenCook) > 0.04 || (cook === 0 && kitchenCook !== 0)) {
        kitchenCook = cook;
        drawKitchen(cook);
      }
      const ready = p >= 0.42 && p < 0.64;
      if (ready !== panelReady) {
        panelReady = ready;
        drawPanel(ready);
      }
      const paid = p >= 0.9;
      if (paid !== cashPaid) {
        cashPaid = paid;
        drawCash(paid);
      }
      // kasa: ödenince fiş çıkar, ₺ düşer
      const pay = seg(p, 0.9, 1);
      receipt.scale.y = 0.15 + Math.min(1, pay * 1.6) * 0.85;
      coin.visible = pay > 0 && pay < 1;
      coin.position.set(1.04, 2.7 - Math.min(1, pay * 1.8) ** 2 * 2.17, 0.55);
      coin.rotation.y = t * 3.5;
      // mutfakta pişerken tava daha hızlı oynar
      pan.rotation.z = Math.sin(t * (p > 0.32 && p < 0.42 ? 12 : 4)) * 0.07;

      // süreçte kamera nesnenin peşinde
      if (p < 0.06) follow.copy(at("table", 0, 1.3, 0));
      else if (p < 0.42) follow.copy(order.position);
      else if (p < 0.8) follow.copy(dish.g.position);
      else follow.copy(bill.position);
      follow.y = Math.max(follow.y - 0.2, 1);
    };

    // ── döngü
    const anchor = new THREE.Vector3();
    let lastDraw = -1,
      frames = 0,
      measure = 0,
      pixelRatio = renderer.getPixelRatio(),
      raf = 0;
    const animate = (now: number) => {
      raf = requestAnimationFrame(animate);
      const dt = Math.max(0, Math.min((now - lastFrame) / 1000, 0.045));
      lastFrame = now;
      if (!visible) return;
      if (!reduceMotion || processing) simTime += dt;
      const t = simTime,
        tact = (t * TAU) / 4,
        smooth = 1 - Math.exp(-dt * 5);
      const rawP = (t - orderStart) / ORDER_SECONDS;
      // süreç bitti: genel görünüme dön
      if (processing && rawP >= 1) stopProcess(true);
      const p = ((rawP % 1) + 1) % 1;
      const step = journeyStepAt(p);
      const activeStation = JOURNEY[step]!.station;
      if (processing) {
        if (step !== lastStep) {
          lastStep = step;
          options.onStep(step);
        }
        const bar = options.progress();
        if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
      }
      stations.forEach((s, i) => {
        const pulse = Math.pow(Math.max(0, Math.sin(tact - i * 0.9)), 7);
        const on = hovered === s.id || (cameraMode === "station" && selected === s.id) || s.id === activeStation;
        s.glowMat.emissiveIntensity = THREE.MathUtils.lerp(s.glowMat.emissiveIntensity, on ? 3.2 : 0.45 + pulse * 0.5, smooth);
      });
      gears.forEach((g, i) => (g.rotation.y = t * (i % 2 ? -1 : 1) * 1.1));
      phone.position.y = Math.sin(tact) * 0.03;
      steam.forEach((s) => {
        const k = (t * 0.5 + (s.userData.i as number) * 0.25) % 1;
        s.position.set(-0.5 + Math.sin(k * 6 + (s.userData.i as number)) * 0.06, 0.3 + k * 0.7, 0.42);
        s.scale.setScalar(0.6 + k * 1.4);
        (s.material as THREE.MeshBasicMaterial).opacity = 0.32 * (1 - k);
      });
      links.forEach((l) =>
        l.dots.forEach((d) => {
          const k = (t * 0.22 + (d.userData.off as number)) % 1;
          l.curve.getPointAt(k, d.position);
          d.scale.setScalar(Math.sin(k * Math.PI) * 1.1 + 0.2);
        }),
      );
      runOrder(p, t);
      ambient.forEach((g, i) => {
        const u = (t / 30 + i / 2 + 0.25) % 1;
        path.getPointAt(menuU + (cashU - menuU) * u, g.position);
        g.position.y += 0.4;
        g.rotation.set(0, 0.18, 0);
        g.visible = u > 0.02 && u < 0.97;
      });
      if (t - lastDraw > 1 / 15 || lastDraw < 0) {
        drawPhone(t, phoneSent);
        updateBelt(t);
        lastDraw = t;
      }
      // kadraj kaydırması yumuşakça
      const [tx, ty] = offTarget();
      if (Math.abs(tx - offX) > 0.5 || Math.abs(ty - offY) > 0.5) {
        offX += (tx - offX) * (1 - Math.exp(-dt * 3));
        offY += (ty - offY) * (1 - Math.exp(-dt * 3));
        applyOffset();
      }
      if (cameraMode === "follow" && !dragging) {
        setGoal();
        cameraAnimating = true;
      } else if (cameraMode === "station" && cameraAnimating) setGoal();
      if (cameraAnimating && !dragging) {
        const sp = 1 - Math.exp(-dt * (cameraMode === "follow" ? 2.2 : 3));
        camera.position.lerp(desiredPos, sp);
        controls.target.lerp(desiredTarget, sp);
        if (cameraMode !== "follow" && camera.position.distanceTo(desiredPos) < 0.015 && controls.target.distanceTo(desiredTarget) < 0.015) cameraAnimating = false;
      }
      controls.autoRotate = !reduceMotion && !dragging && !cameraAnimating && cameraMode === "overview" && now - lastInteraction > 6500;
      controls.autoRotateSpeed = 0.24;
      controls.update(dt);
      // istasyon etiketleri (yalnızca geniş ekranda; CSS dar ekranda gizler)
      if (!lite)
        stations.forEach((s) => {
          anchor.copy(s.group.position).add(s.anchor).project(camera);
          const x = THREE.MathUtils.clamp((anchor.x * 0.5 + 0.5) * width, 40, width - 40);
          const y = THREE.MathUtils.clamp((-anchor.y * 0.5 + 0.5) * height, 30, height - 20);
          s.label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
          s.label.classList.toggle("on", hovered === s.id || (cameraMode === "station" && selected === s.id) || (processing && s.id === activeStation));
        });
      renderer.render(scene, camera);
      if (!readySent && sized) {
        readySent = true;
        root.classList.add("fm-ready");
        options.onReady();
      }
      // yavaş cihazda yalnızca çözünürlüğü düşür
      frames++;
      measure += dt;
      if (measure > 4) {
        if (frames / measure < 43 && pixelRatio > 1) {
          pixelRatio = Math.max(1, pixelRatio - 0.25);
          renderer.setPixelRatio(pixelRatio);
        }
        frames = 0;
        measure = 0;
      }
    };
    raf = requestAnimationFrame(animate);
    cleanups.push(() => {
      cancelAnimationFrame(raf);
      controls.dispose();
      const textures = new Set<THREE.Texture>();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const list = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : [];
        for (const material of list) {
          for (const v of Object.values(material)) if (v instanceof THREE.Texture) textures.add(v);
          material.dispose();
        }
      });
      geometries.forEach((g) => g.dispose());
      textures.forEach((t) => t.dispose());
      env.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    });
    renderer.compile(scene, camera);
    if (lite) root.classList.add("fm-lite");
  } catch (error) {
    console.error("FlowMachine: başlatılamadı", error);
    root.classList.add("fm-failed");
  }
  return dispose;
}
