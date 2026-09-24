export function SectionDivider({
  gold = false,
  orientation = "horizontal",
  className = "",
}: {
  gold?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <div
      className={`${orientation === "horizontal" ? "h-px w-full" : "h-full w-px"} ${className}`}
      style={{
        background: gold ? "var(--color-border-gold)" : "var(--color-border)",
      }}
    />
  );
}
