"use client";

import { useEffect, useMemo, useState } from "react";

// Fondo de luces LED hexagonales — una sola capa continua detrás de toda la
// web (estructura-y-textos.md, sección 4bis, versión corregida 23 sept).
// No son tres racimos por sección: es un único patrón que cubre exactamente
// el alto real de la página, así que nunca empieza ni termina dentro de lo
// que se ve en pantalla. Blanco frío, tres capas de brillo, blend "screen",
// intensidad muy baja con variación lenta (nunca papel pintado uniforme).

const LIGHT = "rgb(232, 241, 255)";
const SQRT3 = Math.sqrt(3);

// El hexágono se dimensiona en proporción al ancho de ventana (no un valor
// fijo): a 1440px de referencia mide 100px, y escala desde ahí. Así a 375px
// se ven varios hexágonos completos con la misma densidad que en escritorio,
// en vez de que uno solo ocupe media pantalla. Con clamp para no acabar
// ilegible en móviles muy estrechos ni gigante en monitores ultra anchos.
const HEX_SIZE_AT_REFERENCE = 100;
const REFERENCE_WIDTH = 1440;
// Suelo del hexágono en móvil. Sube junto con el grosor mínimo de línea: con
// trazos de 1px fijos, un hexágono de 26px daba una proporción trazo/celda del
// 3,8% (frente al 1% de escritorio), demasiado tupido, y además 9.324 polígonos
// con filtros de desenfoque sobre un lienzo de ~9.800px de alto.
const HEX_SIZE_MIN = 48;
const HEX_SIZE_MAX = 130;
// Techo de intensidad: bajo en escritorio ("si compite con el texto, está
// mal"), más bajo aún en móvil, donde hay más líneas por área de pantalla.
const MAX_INTENSITY_DESKTOP = 0.4;
const MAX_INTENSITY_MOBILE = 0.38;

function scaleForWidth(width: number) {
  const hexSize = Math.min(
    HEX_SIZE_MAX,
    Math.max(HEX_SIZE_MIN, (width / REFERENCE_WIDTH) * HEX_SIZE_AT_REFERENCE)
  );
  const t = Math.min(1, Math.max(0, width / REFERENCE_WIDTH));
  const maxIntensity = MAX_INTENSITY_MOBILE + (MAX_INTENSITY_DESKTOP - MAX_INTENSITY_MOBILE) * t;
  return { hexSize, maxIntensity };
}

// Vectores unitarios de un hexágono "flat-top", precalculados a mano: Math.cos
// y Math.sin no dan resultados bit-a-bit idénticos entre SSR y navegador.
const HEX_UNIT_VECTORS: [number, number][] = [
  [1, 0],
  [0.5, SQRT3 / 2],
  [-0.5, SQRT3 / 2],
  [-1, 0],
  [-0.5, -SQRT3 / 2],
  [0.5, -SQRT3 / 2],
];

function hexPoints(cx: number, cy: number, size: number): string {
  return HEX_UNIT_VECTORS.map(
    ([ux, uy]) => `${(cx + size * ux).toFixed(1)},${(cy + size * uy).toFixed(1)}`
  ).join(" ");
}

// Hash entero determinista (sin funciones trascendentes): esto solo se
// evalúa en el cliente (tras medir la página), así que no hay riesgo real de
// hidratación, pero se mantiene el mismo método seguro que el resto del sitio.
function hash(seed: number): number {
  let x = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

function smoothstep(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

// Ruido de valor 1D (interpolación entre puntos de control aleatorios, con
// suavizado): da una variación lenta y orgánica a lo largo del alto de la
// página sin usar Math.sin/cos.
function valueNoise1D(y: number, period: number, seedOffset: number): number {
  const idx = Math.floor(y / period);
  const t = y / period - idx;
  const a = hash(idx + seedOffset);
  const b = hash(idx + 1 + seedOffset);
  return a + (b - a) * smoothstep(t);
}

type Cell = { x: number; y: number; intensity: number };

function buildField(width: number, height: number, hexSize: number, maxIntensity: number): Cell[] {
  const hSpacing = hexSize * 1.5;
  const vSpacing = SQRT3 * hexSize;
  // Se genera con margen de sobra por los cuatro lados y se recorta con
  // overflow:hidden, para que nunca se vea una columna o fila a medias.
  const cols = Math.ceil(width / hSpacing) + 2;
  const rows = Math.ceil(height / vSpacing) + 2;
  const cells: Cell[] = [];

  for (let col = -1; col <= cols; col++) {
    const x = col * hSpacing;
    const colOffset = col % 2 !== 0 ? vSpacing / 2 : 0;
    for (let row = -1; row <= rows; row++) {
      const y = row * vSpacing + colOffset;
      const cellSeed = (col + 4000) * 131 + (row + 4000) * 977;
      const slow = valueNoise1D(y, 1300, 10);
      const mid = valueNoise1D(y, 480, 9000);
      const jitter = hash(cellSeed);
      const raw = slow * 0.55 + mid * 0.3 + jitter * 0.15;
      // Empuja hacia abajo la base: más zonas casi apagadas que encendidas.
      const intensity = Math.pow(smoothstep(raw), 1.8) * maxIntensity;
      cells.push({ x, y, intensity });
    }
  }
  return cells;
}

export function PageLedField() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    let lastWidth = -1;

    // Mide y actualiza sin condiciones. Es la única vía por la que un alto
    // de página nuevo por contenido (fotos, vídeo) se recoge de verdad.
    function measure() {
      lastWidth = window.innerWidth;
      setSize({
        width: window.innerWidth,
        height: document.documentElement.scrollHeight,
      });
    }

    // resize y ResizeObserver también saltan en móvil cuando la barra de
    // direcciones se esconde o reaparece al hacer scroll — eso cambia solo
    // el alto visible, nunca window.innerWidth. Por eso aquí solo se vuelve
    // a medir si el ancho cambió de verdad (rotar el móvil, redimensionar
    // la ventana); si no, se ignora el disparo entero para que la rejilla
    // de hexágonos no se recalcule ni se note moverse a mitad de scroll.
    function measureIfWidthChanged() {
      if (window.innerWidth === lastWidth) return;
      measure();
    }

    measure();

    const ro = new ResizeObserver(measureIfWidthChanged);
    ro.observe(document.documentElement);
    window.addEventListener("resize", measureIfWidthChanged);
    // Estos dos no dependen del ancho: cubren el caso de contenido (vídeo
    // del hero, fotos) que cambia el alto total tras el primer render sin
    // que haya habido ningún resize.
    const timers = [window.setTimeout(measure, 600), window.setTimeout(measure, 2000)];

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureIfWidthChanged);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const { hexSize, maxIntensity } = useMemo(() => scaleForWidth(size.width), [size.width]);
  const scaleRatio = hexSize / HEX_SIZE_AT_REFERENCE;

  const cells = useMemo(
    () =>
      size.width && size.height ? buildField(size.width, size.height, hexSize, maxIntensity) : [],
    [size.width, size.height, hexSize, maxIntensity]
  );

  if (!size.width || !size.height || cells.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden"
      style={{ height: size.height, mixBlendMode: "screen" }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size.width} ${size.height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="page-led-wide" x="-40%" y="-2%" width="180%" height="104%">
            <feGaussianBlur stdDeviation={26 * scaleRatio} />
          </filter>
          <filter id="page-led-mid" x="-40%" y="-2%" width="180%" height="104%">
            <feGaussianBlur stdDeviation={9 * scaleRatio} />
          </filter>
        </defs>

        {/* Halo amplio: blur ~26px a escala de referencia, 50% */}
        <g filter="url(#page-led-wide)">
          {cells.map((c, i) => (
            <polygon
              key={`w-${i}`}
              points={hexPoints(c.x, c.y, hexSize)}
              fill="none"
              stroke={LIGHT}
              strokeWidth={Math.max(2.5, 2.5 * scaleRatio)}
              opacity={c.intensity * 0.5}
            />
          ))}
        </g>

        {/* Halo medio: blur ~9px a escala de referencia, 70% */}
        <g filter="url(#page-led-mid)">
          {cells.map((c, i) => (
            <polygon
              key={`m-${i}`}
              points={hexPoints(c.x, c.y, hexSize)}
              fill="none"
              stroke={LIGHT}
              strokeWidth={Math.max(1.5, 1.5 * scaleRatio)}
              opacity={c.intensity * 0.7}
            />
          ))}
        </g>

        {/* Núcleo nítido: opacidad completa (dentro del techo bajo) */}
        <g>
          {cells.map((c, i) => (
            <polygon
              key={`c-${i}`}
              points={hexPoints(c.x, c.y, hexSize)}
              fill="none"
              stroke={LIGHT}
              strokeWidth={Math.max(1, 1 * scaleRatio)}
              opacity={c.intensity}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
