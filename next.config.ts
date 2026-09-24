import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite abrir el servidor de desarrollo desde el móvil por IP local
  // (http://192.168.10.220:3000). Next.js bloquea por defecto las peticiones
  // cross-origin al dev server que no vengan de localhost o del host con el
  // que arrancó; sin esto, la página cargaría pero el HMR/Fast Refresh (y
  // algunas peticiones internas) fallarían silenciosamente desde el móvil.
  // Si la IP de este PC cambia (otra red, otro lease DHCP), hay que
  // actualizarla aquí.
  allowedDevOrigins: ["192.168.10.220"],
};

export default nextConfig;
