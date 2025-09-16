import Link from "next/link";

import { Card } from "@/app/_components/ui/Card";
import { formatCurrency } from "@/app/_lib/currency";
import { formatDateRange } from "@/app/_lib/dates";
import { getCurrentProfile } from "@/app/_features/auth/session";
import { getGuestBookings } from "@/app/_features/bookings/queries";

export default async function TripsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return <Card className="text-sm text-gray-500">Sign in to view your trips.</Card>;
  }

  const bookings = await getGuestBookings(profile.id);

  if (bookings.length === 0) {
    return (
      <Card className="space-y-3 text-center">
        <p className="text-sm text-gray-500">You have no trips booked yet.</p>
        <Link href="/search" className="text-sm font-semibold text-[var(--color-brand-600)]">
          Discover stays
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Your trips</h1>
        <p className="text-sm text-gray-500">Manage upcoming stays and view booking history.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {bookings.map((booking) => {
          const [checkIn, checkOut] = (booking.date_range as string).slice(1, -1).split(",");
          return (
            <Card key={booking.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{booking.listing?.title ?? "Stay"}</h3>
                  <p className="text-xs text-gray-500">
                    {[booking.listing?.city, booking.listing?.country].filter(Boolean).join(", ")}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {booking.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">{formatDateRange(checkIn, checkOut)}</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(Number(booking.total_price ?? 0), booking.listing?.currency ?? "USD")} total
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
