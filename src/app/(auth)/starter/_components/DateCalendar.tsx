"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

type DateCalendarProps = {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  className?: string;
};

const getMonthCells = (year: number, month: number) => {
  const firstWeekDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const days = [
    ...Array.from({ length: firstWeekDay }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => index + 1),
  ];

  return [...days, ...Array.from({ length: 42 - days.length }, () => null)];
};

const isSameDate = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

export const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseDateParam = (value: string | null) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date();

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

export default function DateCalendar({ selectedDate, onSelect, className }: DateCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );
  const monthCells = useMemo(
    () => getMonthCells(visibleMonth.getFullYear(), visibleMonth.getMonth()),
    [visibleMonth]
  );
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);

  const changeMonth = (offset: number) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1)
    );
  };

  return (
    <section
      className={cn("rounded-[12px] border border-[#edf0f6] bg-[#fcfcfe] p-3 shadow-sm", className)}
      aria-label="Choose a date"
    >
      <div className="flex h-8 items-center justify-between">
        <p className="text-[13px] font-semibold text-[#1e2434]">{monthLabel}</p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month" className="grid size-7 place-items-center rounded-[7px] text-[#6281ef] transition-colors hover:bg-[#eef2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6281ef]">
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => changeMonth(1)} aria-label="Next month" className="grid size-7 place-items-center rounded-[7px] text-[#6281ef] transition-colors hover:bg-[#eef2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6281ef]">
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7" aria-hidden="true">
        {weekDays.map((day) => <span key={day} className="text-center text-[8px] font-semibold text-[#9ba4bf]">{day}</span>)}
      </div>

      <div className="mt-2 grid grid-cols-7 grid-rows-6 place-items-center gap-y-1">
        {monthCells.map((day, index) => {
          if (!day) return <span key={`empty-${index}`} aria-hidden="true" className="size-8" />;

          const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
          const selected = isSameDate(date, selectedDate);

          return (
            <button key={formatDateParam(date)} type="button" onClick={() => onSelect(date)} aria-label={`Select ${monthLabel} ${day}`} aria-pressed={selected} className={cn("grid size-8 place-items-center rounded-[16px] text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6281ef] focus-visible:ring-offset-1 sm:size-9 sm:text-xs", selected ? "bg-[#6382f1] text-white" : "text-[#252a39] hover:bg-[#edf1ff]")}>
              {day}
            </button>
          );
        })}
      </div>
    </section>
  );
}
