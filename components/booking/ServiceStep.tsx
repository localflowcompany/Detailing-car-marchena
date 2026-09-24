import { SERVICES, type ServiceId } from "@/config/availability";

export function ServiceStep({
  selected,
  onSelect,
}: {
  selected: ServiceId | null;
  onSelect: (id: ServiceId) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-headline-sm">Elige el servicio</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SERVICES.map((service) => {
          const isActive = service.id === selected;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelect(service.id)}
              className="flex items-center gap-3 border px-5 py-4 text-left transition-colors"
              style={{
                borderColor: isActive ? "var(--color-gold)" : "#333333",
                background: isActive ? "var(--color-panel)" : "transparent",
              }}
            >
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center border"
                style={{ borderColor: isActive ? "var(--color-gold)" : "#333333" }}
              >
                {isActive && <span className="h-2 w-2 bg-gold" />}
              </span>
              <span className="text-body-md">{service.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
