"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/app/_components/ui/Button";

export function GuestCounter({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const decrement = () => onChange(Math.max(1, value - 1));
  const increment = () => onChange(Math.min(16, value + 1));

  return (
    <div className="inline-flex items-center gap-3">
      <Button type="button" variant="ghost" size="sm" onClick={decrement}>
        <Minus className="h-4 w-4" />
      </Button>
      <span className="text-sm font-semibold">{value} guest{value > 1 ? "s" : ""}</span>
      <Button type="button" variant="ghost" size="sm" onClick={increment}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
