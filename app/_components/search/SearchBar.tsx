"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, MapPin, Search } from "lucide-react";

import { DateRangePicker, type DateRange } from "@/app/_components/forms/DateRangePicker";
import { GuestCounter } from "@/app/_components/forms/GuestCounter";
import { Modal } from "@/app/_components/ui/Modal";
import { Input } from "@/app/_components/ui/Input";
import { Button } from "@/app/_components/ui/Button";
import { formatDateRange } from "@/app/_lib/dates";
import { hydrateFiltersFromUrl, useSearchFilters } from "@/app/_features/search/store";

export function SearchBar({ variant = "default" }: { variant?: "default" | "compact" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { filters, setFilters } = useSearchFilters();
  const [open, setOpen] = useState(false);
  const [draftDestination, setDraftDestination] = useState(filters.destination ?? "");
  const [draftDates, setDraftDates] = useState<DateRange>({ checkIn: filters.checkIn, checkOut: filters.checkOut });
  const [draftGuests, setDraftGuests] = useState(filters.guests);

  useEffect(() => {
    hydrateFiltersFromUrl(searchParams);
  }, [searchParams]);

  useEffect(() => {
    setDraftDestination(filters.destination ?? "");
    setDraftDates({ checkIn: filters.checkIn, checkOut: filters.checkOut });
    setDraftGuests(filters.guests);
  }, [filters.destination, filters.checkIn, filters.checkOut, filters.guests]);

  const summary = useMemo(() => {
    const destination = filters.destination ? filters.destination : "Anywhere";
    const dateRange = filters.checkIn && filters.checkOut ? formatDateRange(filters.checkIn, filters.checkOut) : "Any week";
    const guests = `${filters.guests} guest${filters.guests > 1 ? "s" : ""}`;
    return `${destination} · ${dateRange} · ${guests}`;
  }, [filters.destination, filters.checkIn, filters.checkOut, filters.guests]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (draftDestination) {
      params.set("destination", draftDestination);
    } else {
      params.delete("destination");
    }
    if (draftDates.checkIn) params.set("checkIn", draftDates.checkIn);
    else params.delete("checkIn");
    if (draftDates.checkOut) params.set("checkOut", draftDates.checkOut);
    else params.delete("checkOut");
    params.set("guests", String(draftGuests));

    setFilters({
      destination: draftDestination,
      checkIn: draftDates.checkIn,
      checkOut: draftDates.checkOut,
      guests: draftGuests,
    });

    const url = `/search?${params.toString()}`;
    setOpen(false);
    if (pathname.startsWith("/search")) {
      router.replace(url);
    } else {
      router.push(url);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300"
        aria-label="Search for stays"
      >
        <div className="flex flex-1 flex-col text-left">
          <span className="text-xs uppercase tracking-wide text-gray-400">Search</span>
          <span className="truncate text-sm font-semibold text-gray-800">
            {variant === "compact" ? summary : `${filters.destination ?? "Where to?"}`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {variant === "compact" ? null : (
            <>
              <MapPin className="h-4 w-4" />
              <span>{filters.destination ?? "Anywhere"}</span>
              <span className="text-gray-300">|</span>
              <Calendar className="h-4 w-4" />
              <span>
                {filters.checkIn && filters.checkOut ? formatDateRange(filters.checkIn, filters.checkOut) : "Any week"}
              </span>
              <span className="text-gray-300">|</span>
            </>
          )}
          <Search className="h-4 w-4 text-[var(--color-brand-600)]" />
          <span className="hidden rounded-full bg-[var(--color-brand-600)] px-3 py-1 text-xs font-semibold text-white md:inline">
            Search
          </span>
        </div>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Search stays">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Destination</label>
            <Input
              placeholder="Where are you going?"
              value={draftDestination}
              onChange={(event) => setDraftDestination(event.target.value)}
            />
          </div>
          <DateRangePicker value={draftDates} onChange={setDraftDates} />
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Guests</label>
            <GuestCounter value={draftGuests} onChange={setDraftGuests} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={applyFilters}>
              Search stays
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
