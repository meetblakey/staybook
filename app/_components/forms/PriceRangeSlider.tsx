"use client";

import { Input } from "@/app/_components/ui/Input";

const MIN_PRICE = 20;
const MAX_PRICE = 5000;

export function PriceRangeSlider({
  value,
  onChange,
}: {
  value: { min?: number; max?: number };
  onChange: (value: { min?: number; max?: number }) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Min price</label>
          <Input
            type="number"
            min={MIN_PRICE}
            max={value.max ?? MAX_PRICE}
            value={value.min ?? ""}
            onChange={(event) =>
              onChange({ ...value, min: event.target.value ? Number.parseInt(event.target.value, 10) : undefined })
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Max price</label>
          <Input
            type="number"
            min={value.min ?? MIN_PRICE}
            max={MAX_PRICE}
            value={value.max ?? ""}
            onChange={(event) =>
              onChange({ ...value, max: event.target.value ? Number.parseInt(event.target.value, 10) : undefined })
            }
          />
        </div>
      </div>
    </div>
  );
}
