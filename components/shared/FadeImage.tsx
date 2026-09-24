"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image, { type ImageProps, type StaticImageData } from "next/image";

// Envoltorio de next/image con fundido cruzado real desde la miniatura borrosa,
// y control manual de cuándo empieza la descarga (en vez de fiarse del
// "loading=lazy" nativo, que en móvil puede ser muy conservador o muy laxo
// según el navegador).
//
// Por qué no se usa placeholder="blur" de Next.js: ese modo pinta la miniatura
// como background-image del propio <img>, así que si además se le baja la
// opacidad al <img> para hacer el fundido, la miniatura se desvanece con él y
// no se ve nada. Al pintar el blur en una capa aparte, debajo, el <img> puede
// hacer su fundido encima y se obtiene una disolución de borroso a nítido.
//
// Estrategia de carga (sin loadMargin => inmediata):
// - Por defecto, la foto se monta nada más renderizar, con loading="eager": ni
//   espera al margen de carga perezosa del navegador (pensado para fotos que
//   no están lejos en la página, tipo la rejilla de Servicios) ni compite por
//   ancho de banda como priority/preload (ver nota de deprecación abajo).
// - Con loadMargin, el <Image> no se monta (no hay red hasta entonces) hasta
//   que un IntersectionObserver propio, con ese rootMargin, detecta que el
//   hueco está a punto de entrar en pantalla. Pensado para fotos lejos en la
//   página (bodas, footer): la descarga arranca con mucha antelación en vez de
//   cuando el usuario ya casi está encima.
// - Si el que llama ya pasa priority o preload (la propia foto es LCP, p. ej.
//   las del comparador antes/después), no se le impone loading="eager" además
//   — los docs de Next 16 desaconsejan mezclar preload con loading.

function blurFromSrc(src: ImageProps["src"]): string | undefined {
  if (typeof src === "string") return undefined;
  if ("default" in src) return (src.default as StaticImageData).blurDataURL;
  return (src as StaticImageData).blurDataURL;
}

export function FadeImage({
  className = "",
  alt,
  onLoad,
  placeholder,
  loadMargin,
  ...props
}: ImageProps & {
  loadMargin?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [armed, setArmed] = useState(!loadMargin);
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Si el navegador ya tenía la imagen en caché, "load" puede haber saltado
    // antes de que React enganchase el onLoad de abajo, y se quedaría en
    // opacidad 0 para siempre. img.complete cubre ese caso al montar.
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  useEffect(() => {
    if (armed || !loadMargin) return;
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setArmed(true);
      },
      { rootMargin: loadMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [armed, loadMargin]);

  const blurDataURL =
    placeholder === "blur" ? props.blurDataURL ?? blurFromSrc(props.src) : undefined;
  const showBlurLayer = Boolean(blurDataURL) && Boolean(props.fill);

  const hasOwnLoadSignal = Boolean(props.priority) || Boolean(props.preload);
  const loading = props.loading ?? (hasOwnLoadSignal ? undefined : "eager");

  const wrapperStyle: CSSProperties = props.fill
    ? { position: "absolute", inset: 0 }
    : { display: "inline-block", width: props.width, height: props.height };

  return (
    <span ref={wrapperRef} style={wrapperStyle}>
      {showBlurLayer && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("${blurDataURL}")`,
            backgroundSize: "cover",
            // Hereda el encuadre de la foto (p. ej. el 92% 40% de bodas) para
            // que la miniatura no salte de sitio al fundirse con la nítida.
            backgroundPosition: props.style?.objectPosition ?? "50% 50%",
            backgroundRepeat: "no-repeat",
            filter: "blur(20px)",
            // Se amplía un poco para que el desenfoque no deje los bordes
            // transparentes contra el fondo.
            transform: "scale(1.1)",
          }}
        />
      )}
      {armed && (
        <Image
          {...props}
          ref={imgRef}
          alt={alt}
          loading={loading}
          className={`${className} ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={(event) => {
            setLoaded(true);
            onLoad?.(event);
          }}
        />
      )}
    </span>
  );
}
