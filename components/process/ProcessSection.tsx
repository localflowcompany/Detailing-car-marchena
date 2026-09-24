import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { SectionDivider } from "@/components/shared/SectionDivider";

const STEPS = [
  {
    n: "01",
    title: "Lo vemos juntos.",
    text: "Traes el coche o mandas fotos. Te decimos qué necesita de verdad.",
  },
  {
    n: "02",
    title: "Presupuesto cerrado.",
    text: "Sabes el precio antes de tocar el coche.",
  },
  {
    n: "03",
    title: "Al trabajo.",
    text: "Proceso según cada coche, no un paquete estándar.",
  },
  {
    n: "04",
    title: "Te lo explicamos.",
    text: "Te contamos cómo mantener el resultado.",
  },
];

export function ProcessSection() {
  return (
    <section className="px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll className="mb-12 lg:mb-16">
          <h2 className="text-headline-lg">Cómo trabajamos</h2>
        </RevealOnScroll>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-0">
          {STEPS.map((step, i) => (
            <div key={step.n} className="flex flex-col lg:flex-row lg:flex-1">
              {i > 0 && (
                <>
                  <SectionDivider className="lg:hidden" />
                  <SectionDivider orientation="vertical" className="hidden lg:block" />
                </>
              )}
              <RevealOnScroll
                delay={i * 0.08}
                className="flex flex-1 flex-col gap-3 pt-8 lg:px-8"
              >
                <span className="text-headline-md text-gold">{step.n}</span>
                <h3 className="text-headline-sm">{step.title}</h3>
                <p className="text-body-sm text-muted">{step.text}</p>
              </RevealOnScroll>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
