import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

export function BeforeAfterSection() {
  return (
    <section className="relative px-6 pb-20 pt-32 sm:px-10 sm:pt-40 lg:px-16 lg:pb-28 lg:pt-48">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-bg to-transparent sm:h-56" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
        <RevealOnScroll className="flex flex-1 flex-col gap-5 lg:max-w-sm">
          <h2 className="text-headline-lg">La diferencia se ve</h2>
          <p className="text-label-md text-gold">Arrastra para comparar.</p>
          <p className="text-body-md text-muted">
            No es solo estética: unos faros opacos reducen la seguridad al
            conducir de noche. Transparencia recuperada, protección UV
            incluida.
          </p>
        </RevealOnScroll>

        {/* Sin RevealOnScroll: el slider ya gestiona su propia aparición (foto
            "después" con priority, miniatura borrosa visible al instante) —
            envolverlo ocultaría esa miniatura hasta que la animación de scroll
            decidiera dispararse, el mismo hueco vacío que se evita en
            ServiceCard. */}
        <div className="flex flex-1 justify-center lg:justify-end">
          <BeforeAfterSlider />
        </div>
      </div>
    </section>
  );
}
