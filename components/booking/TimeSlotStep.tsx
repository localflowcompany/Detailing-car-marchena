import { getAvailableSlots } from "@/config/availability";
import { formatDateLabel } from "@/lib/whatsapp";

export function TimeSlotStep({
  date,
  selected,
  onSelect,
}: {
  date: Date;
  selected: string | null;
  onSelect: (time: string) => void;
}) {
  const slots = getAvailableSlots(date);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-headline-sm">
        Elige la hora — {formatDateLabel(date)}
      </h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {slots.map((slot) => {
          const isActive = slot === selected;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSelect(slot)}
              className="border px-4 py-3 text-body-md transition-colors"
              style={{
                borderColor: isActive ? "var(--color-gold)" : "#333333",
                background: isActive ? "var(--color-gold)" : "transparent",
                color: isActive ? "#1A1A1A" : "#FFFFFF",
              }}
            >
              {slot}
            </button>
          );
        })}
      </div>
    </div>
  );
}
