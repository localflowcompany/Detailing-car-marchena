import type { StaticImageData } from "next/image";
import { FadeImage } from "@/components/shared/FadeImage";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";

export function ServiceCard({
  index,
  title,
  text,
  image,
  alt,
  className = "",
  delay = 0,
  imageSizes,
}: {
  index: string;
  title: string;
  text: string;
  image: StaticImageData;
  alt: string;
  className?: string;
  delay?: number;
  imageSizes: string;
}) {
  // La foto y su miniatura borrosa quedan fuera de RevealOnScroll a propósito:
  // ese componente anima opacidad 0->1 por scroll, sin saber si la foto real
  // ha cargado. Si la envolviera, la miniatura borrosa (que sí está disponible
  // al instante, es un data URI ya en el HTML) también se ocultaría hasta que
  // la animación de scroll decidiera dispararse, y podría completarse antes de
  // que la foto esté lista — es decir, el mismo hueco vacío que se quiere
  // evitar. FadeImage ya controla toda su propia aparición (borroso desde el
  // primer instante, fundido a nítido al cargar), así que aquí no hace falta
  // acoplarlo a nada. El texto sí conserva la animación de entrada: no depende
  // de ninguna carga.
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="group relative h-full min-h-[340px] w-full">
        <FadeImage
          src={image}
          alt={alt}
          fill
          placeholder="blur"
          sizes={imageSizes}
          className="object-cover transition-[opacity,transform] duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-bg/85 via-bg/40 to-transparent" />
        <RevealOnScroll
          delay={delay}
          className="absolute inset-0 flex flex-col justify-between p-6 sm:p-7"
        >
          <span className="text-label-tech text-gold">{index}</span>
          <div className="flex flex-col gap-2">
            <h3 className="text-headline-sm">{title}</h3>
            <p className="text-body-sm max-w-sm text-muted">{text}</p>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
