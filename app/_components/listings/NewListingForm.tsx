"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createListing } from "@/app/_features/listings/actions";
import { Button } from "@/app/_components/ui/Button";
import { Input } from "@/app/_components/ui/Input";
import { pushToast } from "@/app/_components/ui/Toast";
import { AmenitiesChecklist } from "@/app/_components/forms/AmenitiesChecklist";

const PROPERTY_TYPES = ["Apartment", "House", "Villa", "Loft", "Townhouse"];
const ROOM_TYPES = ["Entire place", "Private room", "Shared room"];

export function NewListingForm() {
  const [amenities, setAmenities] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const payload = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      propertyType: String(formData.get("propertyType") ?? ""),
      roomType: String(formData.get("roomType") ?? ""),
      maxGuests: Number(formData.get("maxGuests") ?? 1),
      bedrooms: Number(formData.get("bedrooms") ?? 1),
      beds: Number(formData.get("beds") ?? 1),
      bathrooms: Number(formData.get("bathrooms") ?? 1),
      priceNightly: Number(formData.get("priceNightly") ?? 0),
      cleaningFee: Number(formData.get("cleaningFee") ?? 0),
      serviceFee: Number(formData.get("serviceFee") ?? 0),
      currency: String(formData.get("currency") ?? "USD"),
      addressLine1: String(formData.get("addressLine1") ?? ""),
      addressLine2: String(formData.get("addressLine2") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      country: String(formData.get("country") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      amenities,
      coordinates: {
        lat: Number(formData.get("lat") ?? 0),
        lng: Number(formData.get("lng") ?? 0),
      },
    } as const;

    startTransition(async () => {
      try {
        await createListing(payload);
        pushToast({ title: "Listing created", description: "Upload photos to publish your stay.", variant: "success" });
        router.push(`/dashboard/host/listings`);
        router.refresh();
      } catch (error) {
        pushToast({ title: "Could not create listing", description: (error as Error).message, variant: "error" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Title</span>
          <Input name="title" required placeholder="Oceanfront loft" />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">City</span>
          <Input name="city" required placeholder="Lisbon" />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Country</span>
          <Input name="country" required placeholder="Portugal" />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Property type</span>
          <select name="propertyType" required className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm">
            <option value="">Select type</option>
            {PROPERTY_TYPES.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Room type</span>
          <select name="roomType" required className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm">
            <option value="">Select type</option>
            {ROOM_TYPES.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Max guests</span>
          <Input type="number" name="maxGuests" min={1} max={16} defaultValue={4} />
        </label>
      </div>
      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</span>
        <textarea
          name="description"
          rows={4}
          className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm"
          placeholder="Tell guests what makes your place special"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bedrooms</span>
          <Input type="number" name="bedrooms" min={0} max={10} defaultValue={2} />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Beds</span>
          <Input type="number" name="beds" min={1} max={16} defaultValue={2} />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bathrooms</span>
          <Input type="number" step="0.5" name="bathrooms" min={0} max={10} defaultValue={1} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nightly price</span>
          <Input type="number" name="priceNightly" min={0} defaultValue={160} />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Cleaning fee</span>
          <Input type="number" name="cleaningFee" min={0} defaultValue={25} />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Service fee</span>
          <Input type="number" name="serviceFee" min={0} defaultValue={15} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Latitude</span>
          <Input type="number" name="lat" step="0.00001" required placeholder="38.7223" />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Longitude</span>
          <Input type="number" name="lng" step="0.00001" required placeholder="-9.1393" />
        </label>
      </div>
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Amenities</span>
        <AmenitiesChecklist selected={amenities} onChange={setAmenities} />
      </div>
      <div className="flex justify-end gap-3">
        <Button type="submit" loading={isPending}>
          Save listing
        </Button>
      </div>
    </form>
  );
}
