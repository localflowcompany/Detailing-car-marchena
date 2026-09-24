import { site } from "@/config/site";

export function MapEmbed() {
  return (
    <div className="relative h-[320px] w-full overflow-hidden border border-[#2a2a2a] sm:h-[420px]">
      {/* Contenido de reserva, siempre presente detrás del iframe: si el mapa
          no carga o un bloqueador de contenido lo tumba (frecuente en móvil),
          esto sigue diciendo dónde está el negocio en vez de un hueco vacío. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-panel px-6 text-center">
        <span className="text-label-tech text-gold">{site.name}</span>
        <span className="text-body-sm text-muted">{site.location.town}</span>
        <span className="text-body-sm text-muted">{site.location.address}</span>
        <a
          href={site.location.mapsLinkHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center border border-gold px-5 py-2.5 text-label-md text-gold transition-colors hover:bg-gold hover:text-bg"
        >
          Ver en Google Maps
        </a>
      </div>
      <iframe
        title={`Ubicación de ${site.name}`}
        src={site.location.mapsEmbedSrc}
        className="relative h-full w-full border-0 bg-transparent"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
