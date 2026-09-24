const STEP_LABELS = ["Servicio", "Día", "Hora", "Tus datos"];

export function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex w-full items-center gap-2 sm:gap-3">
      {STEP_LABELS.map((label, i) => {
        const stepNumber = i + 1;
        const isActive = stepNumber === current;
        const isDone = stepNumber < current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center border text-label-tech"
                style={{
                  borderColor: isActive || isDone ? "var(--color-gold)" : "#333333",
                  color: isActive || isDone ? "var(--color-gold)" : "#666666",
                  background: isDone ? "var(--color-gold)" : "transparent",
                }}
              >
                <span style={{ color: isDone ? "#1A1A1A" : undefined }}>
                  {stepNumber}
                </span>
              </span>
              <span
                className="text-label-tech hidden sm:inline"
                style={{ color: isActive ? "var(--color-gold)" : "#666666" }}
              >
                {label.toUpperCase()}
              </span>
            </div>
            {stepNumber < STEP_LABELS.length && (
              <span
                className="h-px flex-1"
                style={{ background: isDone ? "var(--color-gold)" : "#2A2A2A" }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
