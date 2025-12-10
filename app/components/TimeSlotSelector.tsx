"use client";

import { useState } from "react";
import {
  format,
  addMinutes,
  setHours,
  setMinutes,
  isSameMinute,
} from "date-fns";

interface TimeSlotSelectorProps {
  selectedDate: Date;
  bookedTimes: Date[];
  onSelect: (time: Date) => void;
}

export default function TimeSlotSelector({
  selectedDate,
  bookedTimes,
  onSelect,
}: TimeSlotSelectorProps) {
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  const timeSlots = [];
  let currentTime = setMinutes(setHours(selectedDate, 9), 0);
  const endTime = setMinutes(setHours(selectedDate, 17), 0);

  while (currentTime < endTime) {
    timeSlots.push(currentTime);
    currentTime = addMinutes(currentTime, 30);
  }

  const handleSelect = (time: Date) => {
    setSelectedTime(time);
    onSelect(time);
  };

  return (
    <div className="mt-8">
      <h3 className="font-semibold text-zinc-900 mb-4">Select a Time</h3>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {timeSlots.map((time, i) => {
          const isTaken = bookedTimes.some((booked) =>
            isSameMinute(booked, time)
          );

          const isSelected = selectedTime && isSameMinute(time, selectedTime);

          return (
            <button
              key={i}
              onClick={() => handleSelect(time)}
              disabled={isTaken}
              className={`
                py-3 px-4 rounded-lg text-sm font-medium border transition-all
                ${
                  isTaken
                    ? "bg-zinc-100 text-zinc-400 border-zinc-100 cursor-not-allowed decoration-slice line-through"
                    : isSelected
                    ? "bg-zinc-900 border-zinc-900 text-white shadow-md"
                    : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50"
                }
              `}
            >
              {format(time, "h:mm aa")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
