"use client";

import { startOfDay } from "date-fns";
import { useMemo } from "react";

import { Input } from "@/app/_components/ui/Input";

export type DateRange = {
  checkIn?: string;
  checkOut?: string;
};

export function DateRangePicker({ value, onChange }: { value: DateRange; onChange: (value: DateRange) => void }) {
  const today = useMemo(() => startOfDay(new Date()).toISOString().slice(0, 10), []);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Check-in</label>
        <Input
          type="date"
          min={today}
          value={value.checkIn ?? ""}
          onChange={(event) => onChange({ ...value, checkIn: event.target.value })}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Check-out</label>
        <Input
          type="date"
          min={value.checkIn ?? today}
          value={value.checkOut ?? ""}
          onChange={(event) => onChange({ ...value, checkOut: event.target.value })}
        />
      </div>
    </div>
  );
}
