"use client";

import { useState } from "react";
import { isDateBookable } from "@/config/availability";
import {
  addMonths,
  getMonthMatrix,
  isSameDay,
  isSameMonth,
  MONTH_LABELS,
  startOfMonth,
  WEEKDAY_LABELS,
} from "@/lib/calendar";

const MAX_MONTHS_AHEAD = 2;

export function CalendarStep({
  selected,
  onSelect,
}: {
  selected: Date | null;
  onSelect: (date: Date) => void;
}) {
  const currentMonth = startOfMonth(new Date());
  const [viewMonth, setViewMonth] = useState(currentMonth);

  const weeks = getMonthMatrix(viewMonth);
  const canGoPrev = viewMonth.getTime() > currentMonth.getTime();
  const canGoNext =
    viewMonth.getTime() < addMonths(currentMonth, MAX_MONTHS_AHEAD).getTime();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-headline-sm">Elige el día</h2>

      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Mes anterior"
          disabled={!canGoPrev}
          onClick={() => setViewMonth((m) => addMonths(m, -1))}
          className="border border-[#333333] px-3 py-2 text-white transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
        >
          ‹
        </button>
        <span className="text-headline-sm">
          {MONTH_LABELS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </span>
        <button
          type="button"
          aria-label="Mes siguiente"
          disabled={!canGoNext}
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="border border-[#333333] px-3 py-2 text-white transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="text-label-tech text-muted py-1">
            {label}
          </span>
        ))}

        {weeks.flatMap((week, wi) =>
          week.map((date, di) => {
            if (!date) return <span key={`${wi}-${di}`} />;

            const bookable = isDateBookable(date);
            const isSelected = selected ? isSameDay(date, selected) : false;
            const inMonth = isSameMonth(date, viewMonth);

            return (
              <button
                key={`${wi}-${di}`}
                type="button"
                disabled={!bookable}
                onClick={() => onSelect(date)}
                className="aspect-square border text-body-sm transition-colors"
                style={{
                  borderColor: isSelected ? "var(--color-gold)" : "#2A2A2A",
                  background: isSelected ? "var(--color-gold)" : "transparent",
                  color: !bookable
                    ? "#555555"
                    : isSelected
                      ? "#1A1A1A"
                      : inMonth
                        ? "#FFFFFF"
                        : "#777777",
                  cursor: bookable ? "pointer" : "not-allowed",
                }}
              >
                {date.getDate()}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
