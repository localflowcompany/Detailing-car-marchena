import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { SectionDivider } from "@/components/shared/SectionDivider";

const MODELS = [
  "FERRARI ROMA",
  "PORSCHE CAYENNE",
  "VOLKSWAGEN GOLF R",
  "CITROËN C3",
];

export function CarShowcase() {
  const track = [...MODELS, ...MODELS];

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <RevealOnScroll>
          <h2 className="text-headline-lg text-center">
            Han pasado por nuestro taller
          </h2>
        </RevealOnScroll>
      </div>

      <div className="my-12 overflow-hidden">
        <SectionDivider gold />
        <div className="marquee flex w-max items-center gap-8 py-8">
          {track.map((model, i) => (
            <span key={i} className="flex items-center gap-8 whitespace-nowrap">
              <span className="text-headline-md text-gold">{model}</span>
              <span className="text-gold/40">·</span>
            </span>
          ))}
        </div>
        <SectionDivider gold />
      </div>

      <RevealOnScroll delay={0.1} className="mx-auto max-w-2xl px-6 text-center sm:px-10">
        <p className="text-body-md text-muted">
          Del utilitario de diario al deportivo de fin de semana. El proceso
          cambia según el coche; el cuidado, no.
        </p>
      </RevealOnScroll>
    </section>
  );
}
