"use client";

import { useCallback, useRef, useState, type PointerEvent } from "react";
import { FadeImage } from "@/components/shared/FadeImage";
import faroDespuesImg from "@/public/images/faro-despues.jpg";
import faroAntesImg from "@/public/images/faro-antes.jpg";

export function BeforeAfterSlider() {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const positionFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    return Math.min(100, Math.max(0, pct));
  }, []);

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      draggingRef.current = true;
      containerRef.current?.setPointerCapture(e.pointerId);
      const pct = positionFromClientX(e.clientX);
      if (pct !== null) setPosition(pct);
    },
    [positionFromClientX]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      const pct = positionFromClientX(e.clientX);
      if (pct !== null) setPosition(pct);
    },
    [positionFromClientX]
  );

  const handlePointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    containerRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative aspect-square w-full max-w-xl select-none overflow-hidden border border-[#2a2a2a]"
      style={{ touchAction: "none" }}
    >
      {/* Después: faro restaurado, capa base */}
      <FadeImage
        src={faroDespuesImg}
        alt="Faro restaurado, transparente y con la luz recuperada"
        fill
        placeholder="blur"
        className="pointer-events-none object-cover transition-opacity duration-700 ease-out"
        sizes="(min-width: 1024px) 576px, 100vw"
        priority
      />

      {/* Antes: faro opaco, recortado a la posición del slider */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <FadeImage
          src={faroAntesImg}
          alt="Faro opaco antes de la restauración"
          fill
          placeholder="blur"
          className="object-cover transition-opacity duration-700 ease-out"
          sizes="(min-width: 1024px) 576px, 100vw"
          priority
        />
      </div>

      <span className="pointer-events-none absolute left-3 top-3 text-label-tech text-white/80">
        ANTES
      </span>
      <span className="pointer-events-none absolute right-3 top-3 text-label-tech text-white/80">
        DESPUÉS
      </span>

      {/* Línea + agarre visual, sincronizados con la posición */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 w-px bg-gold"
        style={{ left: `${position}%` }}
      >
        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-gold bg-bg">
          <span className="text-gold text-[10px]">⇔</span>
        </span>
      </div>

      {/* Oculto visualmente: solo para el foco y las flechas de teclado */}
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(position)}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label="Arrastra para comparar antes y después"
        className="sr-only-slider absolute inset-0 h-full w-full"
      />

      <style jsx>{`
        .sr-only-slider {
          opacity: 0;
          pointer-events: none;
        }
        .sr-only-slider:focus-visible {
          pointer-events: auto;
          opacity: 1;
          outline: 2px solid var(--color-gold);
          outline-offset: -2px;
        }
      `}</style>
    </div>
  );
}
