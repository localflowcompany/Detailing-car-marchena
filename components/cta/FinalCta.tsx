import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { LogoButton } from "@/components/shared/LogoButton";

export function FinalCta() {
  return (
    <section className="px-6 py-28 sm:px-10 lg:py-40">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-8 text-center">
        <RevealOnScroll>
          <h2 className="text-headline-lg">¿Reservamos?</h2>
        </RevealOnScroll>
        <RevealOnScroll delay={0.1}>
          <p className="text-body-lg text-muted">
            Pulsa el logo y elige el día que te venga bien.
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={0.2}>
          <LogoButton variant="final" />
        </RevealOnScroll>
      </div>
    </section>
  );
}
