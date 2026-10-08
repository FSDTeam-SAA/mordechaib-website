"use client";

import { useState } from "react";
import DateCalendar, { formatDateParam } from "./DateCalendar";

type BookingCalendarProps = {
  onNext: (date: string) => void;
};

export default function BookingCalendar({ onNext }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  return (
    <div className="mt-6 flex flex-1 flex-col sm:mt-8">
      <DateCalendar selectedDate={selectedDate} onSelect={setSelectedDate} className="w-full" />

      <div className="mt-4 flex items-center justify-between gap-4 rounded-[10px] bg-[#f4f6fd] px-4 py-3">
        <span className="text-xs text-[#7a849e]">Selected date</span>
        <span className="text-right text-sm font-semibold text-[#20263a]">
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      <button type="button" onClick={() => onNext(formatDateParam(selectedDate))} className="mt-4 h-11 w-full rounded-[10px] bg-[#5f7ff0] text-sm font-medium text-white transition-colors hover:bg-[#526fdb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5f7ff0] focus-visible:ring-offset-2">
        Next
      </button>
    </div>
  );
}
