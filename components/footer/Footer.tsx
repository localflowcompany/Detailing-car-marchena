import { FadeImage } from "@/components/shared/FadeImage";
import { site } from "@/config/site";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { SectionDivider } from "@/components/shared/SectionDivider";
import { MapEmbed } from "./MapEmbed";

export function Footer() {
  return (
    <footer className="px-6 pb-10 pt-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <RevealOnScroll>
          <MapEmbed />
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div className="flex flex-col gap-4">
            <FadeImage
              src="/images/logo-hero.png"
              alt={site.name}
              width={140}
              height={110}
              loadMargin="1200px 0px"
              className="w-28 object-contain transition-opacity duration-500 ease-out"
            />
            <p className="text-body-sm text-muted">{site.location.town}</p>
            <p className="text-body-sm text-muted">{site.location.address}</p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-label-tech text-gold">Contacto</span>
            <a href={`tel:${site.phone.tel}`} className="text-body-md hover:text-gold">
              {site.phone.display}
            </a>
            <p className="text-body-sm text-muted">{site.hours}</p>
            <a
              href={site.instagram.href}
              className="text-body-sm text-muted hover:text-gold"
            >
              {site.instagram.handle}
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-label-tech text-gold">Ubicación</span>
            <a
              href={site.location.mapsLinkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-body-sm text-muted hover:text-gold"
            >
              Ver en Google Maps
            </a>
          </div>
        </div>

        <div className="mt-12">
          <SectionDivider />
        </div>

        <div className="mt-6 text-body-sm text-muted">
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
