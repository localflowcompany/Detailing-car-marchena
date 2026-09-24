"use client";

import { useRef } from "react";
import { FadeImage } from "@/components/shared/FadeImage";
import Link from "next/link";
import bodaImg from "@/public/images/boda.jpg";
import { motion, useScroll, useTransform } from "framer-motion";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";

export function WeddingsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // El recorrido del paralaje no puede superar el margen que deja el zoom de
  // la imagen. Con scale(1.2) sobra un 10% de alto por cada extremo, así que
  // ±12% dejaba ~16px sin foto en cada punta. Se reduce el recorrido a ±8% en
  // vez de subir el zoom: subirlo a 1.3 recortaría más el encuadre (los lazos
  // de flores quedan justos) y ampliaría más una foto de solo 1058px de ancho.
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center overflow-hidden bg-bg"
    >
      <motion.div className="absolute inset-0" style={{ y: imageY }}>
        <FadeImage
          src={bodaImg}
          alt="Porsche Panamera negro decorado con lazos de flores para una boda"
          fill
          placeholder="blur"
          loadMargin="1200px 0px"
          sizes="100vw"
          className="object-cover transition-opacity duration-700 ease-out"
          style={{ transform: "scale(1.2)", objectPosition: "92% 40%" }}
        />
      </motion.div>

      {/* Viñeteado + degradado fuerte: es el momento de más impacto de la web */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/20" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-bg to-transparent sm:h-64" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(26,26,26,0.65)_100%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 py-32 text-center sm:px-10 lg:py-48">
        <RevealOnScroll y={16}>
          <span className="text-eyebrow text-gold">BODAS Y EVENTOS</span>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1} y={28}>
          <h2 className="text-hero max-w-2xl">
            Tu coche, el día que más se mira
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          <p className="text-body-lg max-w-xl text-muted">
            Descontaminación, pulido y cera de grafeno. Listo para el día que
            no admite un &ldquo;ya lo arreglaremos&rdquo;.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.3}>
          <Link
            href="/reserva?servicio=bodas"
            className="mt-4 inline-flex items-center border border-gold bg-gold px-8 py-4 text-bg transition-colors hover:bg-[#d9ad4d] hover:border-white"
          >
            <span className="text-label-md tracking-[0.08em] uppercase">
              Reservar para mi evento
            </span>
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  );
}
