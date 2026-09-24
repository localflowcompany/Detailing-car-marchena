import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { ServiceCard } from "./ServiceCard";
// Import estático: así Next.js genera solo el blurDataURL de cada foto y se
// puede usar placeholder="blur" (no hay que precalcular base64 a mano).
import exteriorImg from "@/public/images/exterior.jpg";
import interiorImg from "@/public/images/interior.jpg";
import motorImg from "@/public/images/motor.jpg";
import faroImg from "@/public/images/faro-2.jpg";

const SERVICES = [
  {
    index: "01",
    title: "Exterior — Pulido y protección cerámica",
    text: "Descontaminación, pulido por fases y cera cerámica o de grafeno. Brillo que dura meses.",
    image: exteriorImg,
    alt: "Exterior de un coche tras el pulido y la protección cerámica",
  },
  {
    index: "02",
    title: "Interior — Limpieza integral, vapor y ozono",
    text: "Vapor, ozono y desinfección completa. Fuera manchas, olores y suciedad que no se ve.",
    image: interiorImg,
    alt: "Interior de un coche tras la limpieza integral",
  },
  {
    index: "03",
    title: "Motor — Limpieza del vano motor",
    text: "Desengrasado seguro, protegiendo la parte eléctrica. Revisar el coche, mucho más fácil.",
    image: motorImg,
    alt: "Vano motor limpio tras el desengrasado",
  },
  {
    index: "04",
    title: "Faros — Restauración",
    text: "Lijado, pulido y sellado UV. Transparencia y luz recuperadas.",
    image: faroImg,
    alt: "Faro restaurado, transparente",
  },
];

export function ServicesSection() {
  const [exterior, interior, motor, faros] = SERVICES;

  return (
    <section className="px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll className="mb-10 lg:mb-14">
          <h2 className="text-headline-lg">Qué hacemos</h2>
        </RevealOnScroll>

        <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
          <ServiceCard
            {...exterior}
            className="sm:col-span-2"
            imageSizes="(min-width: 1024px) 1152px, 100vw"
          />
          <ServiceCard {...interior} delay={0.05} imageSizes="(min-width: 1024px) 576px, 100vw" />
          <ServiceCard {...motor} delay={0.1} imageSizes="(min-width: 1024px) 576px, 100vw" />
          <ServiceCard
            {...faros}
            delay={0.15}
            className="sm:col-span-2"
            imageSizes="(min-width: 1024px) 1152px, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
