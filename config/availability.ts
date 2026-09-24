// Fase 1 del sistema de reserva (ver estructura-y-textos.md, sección 4):
// los huecos viven en este archivo, sin backend. El panel para que el
// dueño abra/cierre huecos desde el móvil es fase 2, después de cobrar.

export type ServiceId =
  | "exterior"
  | "interior"
  | "motor"
  | "faros"
  | "bodas"
  | "asesorar";

// Etiquetas cortas, tal y como las define estructura-y-textos.md (Página 2,
// Paso 1 — Servicio). Se usan tanto en los chips de selección como dentro
// del mensaje de WhatsApp.
export const SERVICES: { id: ServiceId; label: string }[] = [
  { id: "exterior", label: "Exterior" },
  { id: "interior", label: "Interior" },
  { id: "motor", label: "Motor" },
  { id: "faros", label: "Faros" },
  { id: "bodas", label: "Bodas y eventos" },
  { id: "asesorar", label: "No lo tengo claro, que me asesoren" },
];

// 0 = domingo ... 6 = sábado. El taller cierra los domingos.
export const WORKING_WEEKDAYS = [1, 2, 3, 4, 5, 6];

export const TIME_SLOTS = ["09:00", "10:30", "12:00", "13:30", "16:30", "18:00"];

// Fechas cerradas por completo (festivos, vacaciones). Formato YYYY-MM-DD.
export const CLOSED_DATES: string[] = [];

// Huecos ya ocupados por fecha, para que el demo no muestre el mes entero
// vacío. Formato YYYY-MM-DD -> lista de horas de TIME_SLOTS ya cogidas.
export const BOOKED_SLOTS: Record<string, string[]> = {};

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isWorkingDay(date: Date): boolean {
  return WORKING_WEEKDAYS.includes(date.getDay());
}

export function isPastDay(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compare = new Date(date);
  compare.setHours(0, 0, 0, 0);
  return compare < today;
}

export function getAvailableSlots(date: Date): string[] {
  const iso = toISODate(date);
  const booked = BOOKED_SLOTS[iso] ?? [];
  return TIME_SLOTS.filter((slot) => !booked.includes(slot));
}

export function isDateBookable(date: Date): boolean {
  if (isPastDay(date)) return false;
  if (!isWorkingDay(date)) return false;
  const iso = toISODate(date);
  if (CLOSED_DATES.includes(iso)) return false;
  return getAvailableSlots(date).length > 0;
}
