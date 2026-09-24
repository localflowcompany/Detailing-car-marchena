// Motor del hero con scroll-scrub, portado de Latido (site/assets/hero.js).
// Misma arquitectura: vídeo cargado como Blob, seeks con cola, bucle rAF con
// lerp que se detiene al estabilizarse, IntersectionObserver y scroll pasivo.

// Escritorio (ratón): vídeo con seeks, como siempre.
export const HERO_VIDEO_URL = "/video/hero-scrub.mp4";
// Móvil / táctil: NO se usa vídeo. Se usa una secuencia de 120 imágenes WebP
// (1 de cada 2 fotogramas del vídeo, 854×480, ~680 KB en total) pintadas en un
// <canvas>. Motivo: en el navegador interno de Instagram (y otros WebViews de
// iOS) el <video> no llega a pintar fotogramas al hacer seek sin un toque del
// usuario, así que el coche se quedaba congelado mientras los textos se movían.
// Las imágenes cargan y se pintan en cualquier navegador, sin políticas de
// reproducción. Entre dos fotogramas se hace un fundido para que el scroll
// lento se vea continuo.
export const HERO_FRAME_COUNT = 120;
export const heroFrameUrl = (i: number) =>
  `/video/hero-frames/f${String(i + 1).padStart(3, "0")}.webp`;
export const HERO_POSTER_URL = "/images/hero-poster.jpg";
export const HERO_ENDING_URL = "/images/hero-ending.jpg";

// Únicos gates hacia el hero estático, idénticos a la referencia.
const GATES = [
  "(orientation: landscape) and (pointer: coarse) and (max-height: 560px)",
  "(prefers-reduced-motion: reduce)",
];

type Band = { el: HTMLElement; a: number; b: number; op: number; k: number; kb: number };

export type HeroScrubElements = {
  heroPin: HTMLElement;
  stage: HTMLElement;
  video: HTMLVideoElement;
  poster: HTMLElement;
  scrollCue: HTMLElement | null;
};

// Mismo generador sembrado que Latido: umbrales por palabra idénticos en cada carga.
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

export function wordThresholds(text: string, seed: number) {
  const words = text.split(" ");
  const rand = rng(seed);
  return words.map((w, i) => ({
    w,
    th: ((i / Math.max(1, words.length - 1)) * 0.55 + rand() * 0.06).toFixed(3),
  }));
}

function smoothstep(p: number, e0: number, e1: number) {
  const t = Math.min(1, Math.max(0, (p - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

export function initHeroScrub({ heroPin, stage, video, poster, scrollCue }: HeroScrubElements) {
  const body = document.body;
  const bands: Band[] = Array.from(stage.querySelectorAll<HTMLElement>(".band")).map((el) => {
    const [a, b] = (el.dataset.range ?? "0,1").split(",").map(Number);
    return { el, a, b, op: -1, k: -1, kb: -1 };
  });

  let disposed = false;
  let scrubOn = false;
  let heroOnScreen = true;
  let started = false;
  let objectUrl: string | null = null;
  const abort = new AbortController();

  let target = 0;
  let shown = 0;
  let rafId: number | null = null;
  let lastTick = 0;
  const loadStart = performance.now();

  // Decidido una única vez, aquí, al construir el motor — nunca se vuelve a
  // comprobar en un resize, así que no hay riesgo de recargar el vídeo a
  // mitad de sesión por girar el móvil o redimensionar la ventana.
  const isCoarsePointer =
    typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
  // Táctil → secuencia de imágenes en canvas. Ratón → vídeo.
  const useFrames = isCoarsePointer;
  const videoUrl = HERO_VIDEO_URL;

  const debugMode =
    typeof location !== "undefined" && new URLSearchParams(location.search).get("debug") === "1";

  // --- static-hero / reduced-motion gates ---
  function enableScrub() {
    if (scrubOn) return;
    scrubOn = true;
    body.classList.remove("static-hero-mode");
    poster.style.backgroundImage = `url('${HERO_POSTER_URL}')`;
    startLoad();
    addEventListener("scroll", onScroll, { passive: true });
    bands.forEach((b) => { b.op = -1; b.k = -1; b.kb = -1; });
    onScroll();
  }
  function disableScrub() {
    scrubOn = false;
    body.classList.add("static-hero-mode");
    poster.style.backgroundImage = `url('${HERO_ENDING_URL}')`;
    removeEventListener("scroll", onScroll);
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    pinBandsToFinalState();
  }
  function applyHeroMode() {
    if (GATES.some((q) => matchMedia(q).matches)) disableScrub();
    else enableScrub();
  }
  function pinBandsToFinalState() {
    bands.forEach((b) => {
      b.el.style.opacity = "1";
      b.el.style.setProperty("--k", "1");
      b.el.style.setProperty("--kb", "1");
    });
  }

  const mqls = GATES.map((q) => matchMedia(q));
  mqls.forEach((m) => m.addEventListener("change", applyHeroMode));

  // --- carga del vídeo como Blob ---
  function onCanPlay() {
    if (disposed) return;
    requestSeek(heroProgress() * (video.duration || 1));
    stage.classList.add("video-ready");
  }
  function startLoad() {
    if (started) return;
    started = true;
    if (useFrames) {
      startFrames();
      return;
    }
    fetch(videoUrl, { signal: abort.signal })
      .then((res) => res.blob())
      .then((blob) => {
        if (disposed) return;
        objectUrl = URL.createObjectURL(blob);
        video.src = objectUrl;
        video.load();
        video.addEventListener("canplay", onCanPlay, { once: true });
      })
      .catch((err) => {
        if (!disposed && err?.name !== "AbortError") failVideo();
      });
    video.addEventListener("error", failVideo);
  }
  function failVideo() {
    body.classList.add("video-failed");
    stage.classList.remove("video-ready");
    poster.style.backgroundImage = `url('${HERO_ENDING_URL}')`;
  }

  // --- modo fotogramas (táctil): secuencia de imágenes pintada en canvas ---
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  const frames: (HTMLImageElement | null)[] = new Array(HERO_FRAME_COUNT).fill(null);
  let framesLoaded = 0;
  let lastKey = -1; // posición ya pintada; -1 = hay que repintar
  let posY = 0.5; // equivalente a object-position vertical

  // Orden de carga de grueso a fino (0, 16, 32… luego 8, 24… etc.): a los pocos
  // KB ya hay fotogramas repartidos por todo el recorrido y el scroll responde
  // desde el principio; el resto rellena huecos.
  function loadOrder(n: number) {
    const order: number[] = [];
    const seen = new Set<number>();
    const push = (i: number) => {
      if (!seen.has(i)) { seen.add(i); order.push(i); }
    };
    push(0);
    push(n - 1);
    for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < n; i += step) push(i);
    return order;
  }

  function sizeCanvas() {
    if (!canvas || !ctx) return false;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.round(w * dpr);
    const H = Math.round(h * dpr);
    posY = matchMedia("(orientation: portrait)").matches ? 0.5 : 0.4;
    if (W === canvas.width && H === canvas.height) return false;
    canvas.width = W; // redimensionar borra el canvas y su estado
    canvas.height = H;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    return true;
  }
  function onResize() {
    if (sizeCanvas()) {
      lastKey = -1;
      drawFrames(shown);
    }
  }

  // Pinta la imagen cubriendo todo el canvas (como object-fit: cover).
  function paint(img: HTMLImageElement, alpha: number) {
    if (!ctx || !canvas) return;
    const W = canvas.width;
    const H = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (!iw || !ih) return;
    const s = Math.max(W / iw, H / ih);
    const dw = iw * s;
    const dh = ih * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (W - dw) / 2, (H - dh) * posY, dw, dh);
    ctx.globalAlpha = 1;
  }

  function nearestLoaded(x: number) {
    const c = Math.round(x);
    for (let d = 0; d < HERO_FRAME_COUNT; d++) {
      if (c - d >= 0 && frames[c - d]) return c - d;
      if (c + d < HERO_FRAME_COUNT && frames[c + d]) return c + d;
    }
    return -1;
  }

  function drawFrames(p: number) {
    if (!ctx || !canvas || framesLoaded === 0 || !canvas.width) return;
    const x = clamp(p, 0, 1) * (HERO_FRAME_COUNT - 1);
    const key = Math.round(x * 200);
    if (key === lastKey) return;
    const i = Math.floor(x);
    const f = x - i;
    const a = frames[i];
    const b = frames[Math.min(i + 1, HERO_FRAME_COUNT - 1)];
    if (a && b) {
      // Fundido entre el fotograma actual y el siguiente: scroll continuo.
      paint(a, 1);
      if (f > 0.02 && b !== a) paint(b, f);
      lastKey = key;
    } else {
      // Aún cargando: el fotograma disponible más cercano, y se repinta
      // cuando llegue el que falta.
      const n = nearestLoaded(x);
      if (n < 0) return;
      paint(frames[n]!, 1);
      lastKey = -1;
    }
    if (!stage.classList.contains("video-ready")) stage.classList.add("video-ready");
  }

  function startFrames() {
    canvas = document.createElement("canvas");
    canvas.className = "hero-frames";
    canvas.setAttribute("aria-hidden", "true");
    video.insertAdjacentElement("afterend", canvas);
    ctx = canvas.getContext("2d");
    if (!ctx) {
      failVideo();
      return;
    }
    sizeCanvas();
    addEventListener("resize", onResize, { passive: true });

    const queue = loadOrder(HERO_FRAME_COUNT);
    let active = 0;
    const pump = () => {
      while (!disposed && active < 6 && queue.length) {
        const i = queue.shift()!;
        active++;
        const img = new Image();
        img.decoding = "async";
        const done = () => {
          active--;
          pump();
        };
        img.onload = () => {
          // decode() deja la imagen ya descomprimida para que el primer
          // drawImage no provoque un tirón; si falla, se usa igualmente.
          (img.decode ? img.decode() : Promise.resolve())
            .catch(() => {})
            .then(() => {
              if (disposed) return;
              frames[i] = img;
              framesLoaded++;
              if (lastKey === -1) {
                if (!canvas!.width) sizeCanvas();
                drawFrames(shown);
              }
            })
            .finally(done);
        };
        img.onerror = () => {
          if (i === 0 && !disposed) failVideo();
          done();
        };
        img.src = heroFrameUrl(i);
      }
    };
    pump();
  }

  // --- panel de depuración: solo con ?debug=1, nunca en condiciones normales ---
  // Mide el coste real de cada búsqueda (desde que se escribe currentTime
  // hasta que salta "seeked") para decidir con datos, no a ojo, si el
  // problema en móvil es la resolución del vídeo o la propia búsqueda.
  let debugPanel: HTMLDivElement | null = null;
  let debugInterval: number | null = null;
  let seekStartedAt = 0;
  const seekDurations: number[] = []; // últimas 20, en ms
  const seekCompletions: number[] = []; // timestamps de "seeked" en el último segundo

  function debugSetup() {
    if (!debugMode || debugPanel) return;
    debugPanel = document.createElement("div");
    debugPanel.setAttribute("aria-hidden", "true");
    debugPanel.style.cssText =
      "position:fixed;left:12px;bottom:12px;z-index:99999;background:rgba(0,0,0,0.78);" +
      "color:#7CFC7C;font:11px/1.6 ui-monospace,monospace;padding:8px 10px;border-radius:4px;" +
      "pointer-events:none;white-space:pre;";
    document.body.appendChild(debugPanel);
    debugInterval = window.setInterval(debugRender, 200);
    debugRender();
  }
  function debugRender() {
    if (!debugPanel) return;
    const now = performance.now();
    while (seekCompletions.length && now - seekCompletions[0] > 1000) seekCompletions.shift();
    const last = seekDurations[seekDurations.length - 1];
    const avg = seekDurations.length
      ? seekDurations.reduce((a, b) => a + b, 0) / seekDurations.length
      : undefined;
    const w = video.videoWidth;
    const h = video.videoHeight;
    debugPanel.textContent =
      `hero-scrub debug\n` +
      `último seek: ${last !== undefined ? last.toFixed(0) + " ms" : "–"}\n` +
      `media (20): ${avg !== undefined ? avg.toFixed(0) + " ms" : "–"}\n` +
      `seeks/s: ${seekCompletions.length}\n` +
      (useFrames
        ? `fotogramas: ${framesLoaded}/${HERO_FRAME_COUNT} (canvas)`
        : `vídeo: ${w && h ? `${w}×${h}` : "cargando…"} — ${videoUrl.split("/").pop()}`);
  }
  function debugRecordSeekStart() {
    if (!debugMode) return;
    seekStartedAt = performance.now();
  }
  function debugRecordSeekEnd() {
    if (!debugMode) return;
    const now = performance.now();
    if (seekStartedAt) {
      const dur = now - seekStartedAt;
      seekDurations.push(dur);
      if (seekDurations.length > 20) seekDurations.shift();
    }
    seekCompletions.push(now);
  }
  function debugTeardown() {
    if (debugInterval !== null) window.clearInterval(debugInterval);
    debugPanel?.remove();
  }
  debugSetup();

  // --- seeks con cola: nunca escribir currentTime con un seek en vuelo ---
  // Vuelto exactamente al comportamiento original: requestSeek() se llama en
  // cada tick de rAF, pero solo escribe video.currentTime si no hay ya un
  // seek en vuelo; si lo hay, guarda el objetivo más reciente y lo dispara
  // en cuanto el anterior termina (onSeeked). Esto ya se adapta solo a la
  // velocidad real del decodificador — un límite fijo de tiempo por encima
  // (probado y revertido) solo lo capaba también en dispositivos que sí
  // podían ir más rápido.
  let seekBusy = false;
  let pendingTime: number | null = null;
  function requestSeek(t: number) {
    if (!video.duration) return;
    if (seekBusy) { pendingTime = t; return; }
    seekBusy = true;
    debugRecordSeekStart();
    video.currentTime = t;
  }
  function onSeeked() {
    seekBusy = false;
    debugRecordSeekEnd();
    if (pendingTime !== null) {
      const t = pendingTime;
      pendingTime = null;
      requestSeek(t);
    }
  }
  function onVideoError() {
    seekBusy = false;
    pendingTime = null;
  }
  video.addEventListener("seeked", onSeeked);
  video.addEventListener("error", onVideoError);

  // --- progreso de scroll a través del pin ---
  function heroProgress() {
    const rect = heroPin.getBoundingClientRect();
    const total = heroPin.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return Math.min(1, Math.max(0, -rect.top / total));
  }

  const io = new IntersectionObserver(
    (entries) => {
      heroOnScreen = entries[0].isIntersecting;
      body.classList.toggle("hero-passed", !heroOnScreen);
    },
    { threshold: 0 }
  );
  io.observe(heroPin);

  // --- bands: opacidad por smoothstep, --k / --kb para el efecto por palabra ---
  function updateCaptions(p: number, now: number) {
    const loadK = Math.min(1, (now - loadStart) / 900);
    bands.forEach((band) => {
      const { a, b: end } = band;
      const f = Math.min(0.02, (end - a) / 3);
      // Latido trata así su primera y última band porque empiezan en 0 y acaban en 1;
      // aquí la primera band empieza en 0,28, así que la regla va por rango, no por índice.
      const opensAtStart = a <= 0;
      const closesAtEnd = end >= 1;
      let op: number;
      if (opensAtStart && closesAtEnd) op = 1;
      else if (opensAtStart) op = 1 - smoothstep(p, end - f, end);
      else if (closesAtEnd) op = smoothstep(p, a, a + f);
      else op = smoothstep(p, a, a + f) * (1 - smoothstep(p, end - f, end));
      op = clamp(op, 0, 1);

      const ramp = Math.min(0.025, (end - a) * 0.35);
      let k = clamp((p - a) / ramp, 0, 1);
      if (opensAtStart) k = Math.max(k, loadK);

      const kb = clamp((k - 0.7) * 5, 0, 1);

      if (Math.abs(op - band.op) > 0.004) { band.el.style.opacity = String(op); band.op = op; }
      if (Math.abs(k - band.k) > 0.008) { band.el.style.setProperty("--k", k.toFixed(3)); band.k = k; }
      if (Math.abs(kb - band.kb) > 0.008) { band.el.style.setProperty("--kb", kb.toFixed(3)); band.kb = kb; }
    });

    if (scrollCue) {
      const cueOp = 1 - smoothstep(p, 0, 0.1);
      scrollCue.style.opacity = String(cueOp < 0.02 ? 0 : cueOp);
    }
  }

  // --- bucle rAF: lerp del progreso mostrado hacia el objetivo, y reposo ---
  function tick(now: number) {
    const dt = Math.min(100, now - (lastTick || now));
    lastTick = now;
    const k = 0.16;
    shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
    const stillLoading = now - loadStart < 950;
    if (Math.abs(target - shown) < 0.0005 && !stillLoading) {
      shown = target;
      rafId = null;
      lastTick = 0;
    } else {
      rafId = requestAnimationFrame(tick);
    }
    if (useFrames) drawFrames(shown);
    else if (video.duration) requestSeek(shown * video.duration);
    updateCaptions(shown, now);
  }
  function onScroll() {
    target = heroProgress();
    if (rafId === null && heroOnScreen) rafId = requestAnimationFrame(tick);
  }

  applyHeroMode();
  updateCaptions(0, performance.now());
  if (heroOnScreen && scrubOn) rafId = requestAnimationFrame(tick);

  return () => {
    disposed = true;
    abort.abort();
    removeEventListener("scroll", onScroll);
    removeEventListener("resize", onResize);
    canvas?.remove();
    if (rafId !== null) cancelAnimationFrame(rafId);
    debugTeardown();
    io.disconnect();
    mqls.forEach((m) => m.removeEventListener("change", applyHeroMode));
    video.removeEventListener("seeked", onSeeked);
    video.removeEventListener("error", onVideoError);
    video.removeEventListener("error", failVideo);
    video.removeEventListener("canplay", onCanPlay);
    video.removeAttribute("src");
    video.load();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    stage.classList.remove("video-ready");
    body.classList.remove("static-hero-mode", "video-failed", "hero-passed");
  };
}
