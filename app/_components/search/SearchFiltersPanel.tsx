"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, RefreshCw } from "lucide-react";

import { AmenitiesChecklist } from "@/app/_components/forms/AmenitiesChecklist";
import { PriceRangeSlider } from "@/app/_components/forms/PriceRangeSlider";
import { Button } from "@/app/_components/ui/Button";
import { hydrateFiltersFromUrl, useSearchFilters } from "@/app/_features/search/store";

const PROPERTY_TYPES = ["Apartment", "House", "Villa", "Cabin", "Loft", "Tiny home"];
const ROOM_TYPES = ["Entire place", "Private room", "Shared room"];
const SORT_OPTIONS = [
  { value: "relevance", label: "Top matches" },
  { value: "price_asc", label: "Lowest price" },
  { value: "price_desc", label: "Highest price" },
  { value: "rating_desc", label: "Highest rated" },
];

export function SearchFiltersPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, setFilters, reset } = useSearchFilters();
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({
    min: filters.priceMin,
    max: filters.priceMax,
  });
  const [propertyType, setPropertyType] = useState(filters.propertyType ?? "");
  const [roomType, setRoomType] = useState(filters.roomType ?? "");
  const [amenities, setAmenities] = useState(filters.amenitiesList);
  const [sort, setSort] = useState(filters.sort);

  useEffect(() => {
    hydrateFiltersFromUrl(searchParams);
  }, [searchParams]);

  useEffect(() => {
    setPriceRange({ min: filters.priceMin, max: filters.priceMax });
    setPropertyType(filters.propertyType ?? "");
    setRoomType(filters.roomType ?? "");
    setAmenities(filters.amenitiesList);
    setSort(filters.sort);
  }, [filters.priceMin, filters.priceMax, filters.propertyType, filters.roomType, filters.amenitiesList, filters.sort]);

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (priceRange.min) params.set("priceMin", String(priceRange.min));
    else params.delete("priceMin");
    if (priceRange.max) params.set("priceMax", String(priceRange.max));
    else params.delete("priceMax");
    if (propertyType) params.set("propertyType", propertyType);
    else params.delete("propertyType");
    if (roomType) params.set("roomType", roomType);
    else params.delete("roomType");
    if (amenities.length > 0) params.set("amenities", amenities.join(","));
    else params.delete("amenities");
    params.set("sort", sort);

    setFilters({
      priceMin: priceRange.min,
      priceMax: priceRange.max,
      propertyType: propertyType || undefined,
      roomType: roomType || undefined,
      amenitiesList: amenities,
      sort,
    });

    router.replace(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    reset();
    setPriceRange({});
    setPropertyType("");
    setRoomType("");
    setAmenities([]);
    setSort("relevance");
    router.replace("/search");
  };

  return (
    <div className="space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          <Filter className="mr-2 inline h-5 w-5 text-[var(--color-brand-600)]" /> Filters
        </h2>
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-800"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Property type</h3>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setPropertyType(propertyType === option ? "" : option)}
                className={`rounded-full border px-3 py-1 text-sm ${propertyType === option ? "border-[var(--color-brand-600)] bg-[var(--color-brand-600)]/10 text-[var(--color-brand-700)]" : "border-gray-200 text-gray-600"}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Room type</h3>
          <div className="flex flex-wrap gap-2">
            {ROOM_TYPES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRoomType(roomType === option ? "" : option)}
                className={`rounded-full border px-3 py-1 text-sm ${roomType === option ? "border-[var(--color-brand-600)] bg-[var(--color-brand-600)]/10 text-[var(--color-brand-700)]" : "border-gray-200 text-gray-600"}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Price per night</h3>
          <PriceRangeSlider value={priceRange} onChange={setPriceRange} />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Amenities</h3>
          <AmenitiesChecklist selected={amenities} onChange={setAmenities} />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Sort results</h3>
          <div className="grid gap-2">
            {SORT_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={sort === option.value}
                  onChange={() => setSort(option.value as typeof sort)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={apply}>Apply filters</Button>
      </div>
    </div>
  );
}
