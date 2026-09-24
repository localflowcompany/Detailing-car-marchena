// Todos los datos de contacto de la web viven aquí. Los marcados [CONFIRMAR]
// son placeholders razonables: la web funciona con ellos, pero hay que
// sustituirlos por los datos reales del taller antes de publicar.

export const site = {
  name: "Detailing Car Marchena",
  phone: {
    display: "621 21 78 47",
    tel: "+34621217847",
    whatsapp: "34621217847",
  },
  location: {
    town: "Marchena, Sevilla",
    address: "[CONFIRMAR] Dirección exacta del taller",
    mapsEmbedSrc:
      "https://maps.google.com/maps?q=Marchena,+Sevilla&z=16&output=embed",
    mapsLinkHref: "https://www.google.com/maps/search/?api=1&query=Marchena,+Sevilla",
  },
  hours: "[CONFIRMAR] Horario de apertura",
  instagram: {
    handle: "[CONFIRMAR usuario de Instagram]",
    href: "#",
  },
} as const;
