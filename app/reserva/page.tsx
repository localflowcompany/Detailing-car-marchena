import Link from "next/link";
import { site } from "@/config/site";
import { BookingFlow } from "@/components/booking/BookingFlow";

export const metadata = {
  title: "Reserva tu cita — Detailing Car Marchena",
};

export default async function ReservaPage({
  searchParams,
}: PageProps<"/reserva">) {
  const params = await searchParams;
  const servicioParam = params.servicio;
  const initialService = Array.isArray(servicioParam)
    ? (servicioParam[0] ?? null)
    : (servicioParam ?? null);

  return (
    <main className="min-h-screen bg-bg px-6 pb-24 pt-8 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-eyebrow text-muted transition-colors hover:text-gold"
        >
          ← Volver a inicio
        </Link>

        <div className="mt-10 flex flex-col gap-3">
          <h1 className="text-headline-lg">Reserva tu cita</h1>
          <p className="text-body-md text-muted">
            Elige servicio, día y hora. Si prefieres hablarlo antes,
            llámanos al{" "}
            <a href={`tel:${site.phone.tel}`} className="text-gold">
              {site.phone.display}
            </a>
            .
          </p>
        </div>

        <div className="mt-12">
          <BookingFlow initialService={initialService} />
        </div>
      </div>
    </main>
  );
}
