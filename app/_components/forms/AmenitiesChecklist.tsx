"use client";

const AMENITIES = [
  "Wifi",
  "Kitchen",
  "Washer",
  "Dryer",
  "Air conditioning",
  "Dedicated workspace",
  "Parking",
  "Pool",
  "Hot tub",
  "EV charger",
  "Crib",
];

export function AmenitiesChecklist({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (value: string[]) => void;
}) {
  const toggle = (amenity: string) => {
    if (selected.includes(amenity)) {
      onChange(selected.filter((item) => item !== amenity));
    } else {
      onChange([...selected, amenity]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-700">
      {AMENITIES.map((amenity) => {
        const checked = selected.includes(amenity);
        return (
          <label key={amenity} className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(amenity)}
              className="h-4 w-4 rounded border-gray-300 text-[var(--color-brand-600)] focus:ring-[var(--color-brand-600)]"
            />
            {amenity}
          </label>
        );
      })}
    </div>
  );
}
