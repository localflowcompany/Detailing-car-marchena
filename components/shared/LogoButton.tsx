"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

type LogoButtonProps = {
  variant?: "hero" | "final";
  href?: string;
  className?: string;
};

export function LogoButton({
  variant = "final",
  href = "/reserva",
  className = "",
}: LogoButtonProps) {
  const isHero = variant === "hero";

  return (
    <Link
      href={href}
      aria-label="Pulsa aquí para reservar cita"
      className={`group relative inline-flex items-center ${className}`}
    >
      <motion.span
        className="relative inline-flex items-center justify-center border border-[#333333] bg-panel"
        style={{
          width: isHero ? 48 : 128,
          height: isHero ? 48 : 128,
        }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Brillo dorado que recorre el borde: Tailwind ya envuelve
            group-hover en @media(hover:hover), así que no queda "pegado" tras
            un toque; group-active añade la respuesta táctil inmediata que
            faltaba en pantallas sin hover real */}
        <span
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-active:opacity-100 group-focus-visible:opacity-100"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, var(--color-gold) 12%, transparent 24%)",
            animation: "logo-sweep 2.4s linear infinite",
          }}
        />
        <span className="absolute inset-[1px] bg-panel" />
        <Image
          src="/images/logo-boton.png"
          alt="Detailing Car Marchena"
          width={isHero ? 40 : 108}
          height={isHero ? 40 : 108}
          className="relative z-10 object-contain"
          priority={variant === "hero"}
        />
      </motion.span>
      <style jsx>{`
        @keyframes logo-sweep {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Link>
  );
}
