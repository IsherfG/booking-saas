"use client";

import { useState } from "react";
import { format, addDays, isSameDay } from "date-fns";

interface DateSelectorProps {
  selectedDate: Date | undefined;
  onSelect: (date: Date) => void;
}

export default function DateSelector({
  selectedDate,
  onSelect,
}: DateSelectorProps) {
  const [days] = useState(() => {
    const today = new Date();
    return Array.from({ length: 14 }).map((_, i) => addDays(today, i));
  });

  return (
    <div className="w-full mb-8">
      <h3 className="font-semibold text-zinc-900 mb-4 text-left">
        Select a Date
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {days.map((date) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate);

          return (
            <button
              key={date.toISOString()}
              onClick={() => onSelect(date)}
              className={`
                flex flex-col items-center justify-center min-w-[70px] h-[80px] rounded-xl border transition-all
                ${
                  isSelected
                    ? "bg-zinc-900 border-zinc-900 text-white shadow-lg scale-105"
                    : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50"
                }
              `}
            >
              <span className="text-xs font-medium uppercase opacity-80">
                {format(date, "EEE")}
              </span>
              <span className="text-xl font-bold">{format(date, "d")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
