import { site } from "@/config/site";

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function formatDateLabel(date: Date): string {
  return `${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}

export function buildBookingWhatsAppLink(params: {
  serviceLabel: string;
  date: Date;
  time: string;
  carModel: string;
  name: string;
}): string {
  const { serviceLabel, date, time, carModel, name } = params;
  const text =
    `Hola, quiero reservar cita para ${serviceLabel} el ${formatDateLabel(date)} ` +
    `a las ${time}. Mi coche es un ${carModel}. Soy ${name}.`;
  return `https://wa.me/${site.phone.whatsapp}?text=${encodeURIComponent(text)}`;
}
