"use client";

import { useMemo, useState, useTransition } from "react";

import { createBooking } from "@/app/_features/bookings/actions";
import type { ListingDetail } from "@/app/_features/listings/types";
import { DateRangePicker, type DateRange } from "@/app/_components/forms/DateRangePicker";
import { GuestCounter } from "@/app/_components/forms/GuestCounter";
import { Button } from "@/app/_components/ui/Button";
import { pushToast } from "@/app/_components/ui/Toast";
import { calculateStayPrice } from "@/app/_lib/pricing";
import { formatCurrency } from "@/app/_lib/currency";

export function ListingBookingPanel({ listing }: { listing: ListingDetail }) {
  const [dates, setDates] = useState<DateRange>({ checkIn: undefined, checkOut: undefined });
  const [guests, setGuests] = useState(1);
  const [isPending, startTransition] = useTransition();
  const { checkIn, checkOut } = dates;

  const breakdown = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (Number.isNaN(checkInDate.valueOf()) || Number.isNaN(checkOutDate.valueOf())) return null;
    return calculateStayPrice({
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nightlyRate: Number(listing.price_nightly),
      cleaningFee: Number(listing.cleaning_fee ?? 0),
      serviceFee: Number(listing.service_fee ?? 0),
    });
  }, [checkIn, checkOut, listing.price_nightly, listing.cleaning_fee, listing.service_fee]);

  const handleSubmit = () => {
    if (!checkIn || !checkOut || !breakdown) {
      pushToast({ title: "Choose your dates", description: "Select check-in and check-out to continue.", variant: "error" });
      return;
    }

    startTransition(async () => {
      try {
        await createBooking({
          listingId: listing.id,
          checkIn: checkIn!,
          checkOut: checkOut!,
          guests,
          totalPrice: breakdown.total,
        });
        pushToast({ title: "Request sent", description: "We saved your reservation request.", variant: "success" });
      } catch (error) {
        pushToast({ title: "Reservation failed", description: (error as Error).message, variant: "error" });
      }
    });
  };

  return (
    <div className="sticky top-24 space-y-4 rounded-3xl border border-gray-100 p-6 shadow-lg shadow-gray-200/50">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-gray-900">
          {formatCurrency(listing.price_nightly, listing.currency ?? "USD")}
        </span>
        <span className="text-sm text-gray-500">night</span>
      </div>
      <DateRangePicker value={dates} onChange={setDates} />
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Guests</label>
        <GuestCounter value={guests} onChange={setGuests} />
      </div>
      {breakdown ? (
        <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
          <div className="flex items-center justify-between"><span>{breakdown.nights} nights</span><span>{formatCurrency(breakdown.baseTotal, listing.currency ?? "USD")}</span></div>
          <div className="flex items-center justify-between"><span>Cleaning fee</span><span>{formatCurrency(breakdown.cleaningFee, listing.currency ?? "USD")}</span></div>
          <div className="flex items-center justify-between"><span>Service fee</span><span>{formatCurrency(breakdown.serviceFee, listing.currency ?? "USD")}</span></div>
          <div className="mt-3 flex items-center justify-between text-base font-semibold text-gray-900"><span>Total</span><span>{formatCurrency(breakdown.total, listing.currency ?? "USD")}</span></div>
        </div>
      ) : null}
      <Button onClick={handleSubmit} loading={isPending} className="w-full justify-center">
        Reserve
      </Button>
    </div>
  );
}
