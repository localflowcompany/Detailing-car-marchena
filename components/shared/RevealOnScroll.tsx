"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Márgenes asimétricos, a propósito. Abajo se mantiene el -10%: obliga a que el
// elemento entre bien en pantalla antes de animarse, que es lo que hace bonita
// la entrada. Arriba pasa a +25%: con once=false y un -10% arriba, el elemento
// se desvanecía cuando aún estaba a ~38px del borde superior, o sea a la vista,
// y al bajar (que es como se lee la web) se veía desaparecer el contenido en la
// cara. Con +25% no se revierte hasta que está bien fuera de pantalla.
const VIEWPORT_MARGIN = "25% 0px -10% 0px";

export function RevealOnScroll({
  children,
  delay = 0,
  y = 24,
  className,
  once = false,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: VIEWPORT_MARGIN }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
