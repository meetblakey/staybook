import Link from "next/link";

import { Card } from "@/app/_components/ui/Card";
import { formatCurrency } from "@/app/_lib/currency";
import { formatDateRange } from "@/app/_lib/dates";
import { getCurrentProfile } from "@/app/_features/auth/session";
import { getHostBookings } from "@/app/_features/bookings/queries";

export default async function HostBookingsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return <Card className="text-sm text-gray-500">Sign in to view bookings.</Card>;
  }

  const bookings = await getHostBookings(profile.id);

  if (bookings.length === 0) {
    return (
      <Card className="space-y-3 text-center">
        <p className="text-sm text-gray-500">No confirmed trips yet.</p>
        <Link href="/dashboard/host/listings" className="text-sm font-semibold text-[var(--color-brand-600)]">
          Promote your listings
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Upcoming bookings</h1>
        <p className="text-sm text-gray-500">Keep track of guests and payouts.</p>
      </div>
      <div className="overflow-hidden rounded-3xl border border-gray-100">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Stay</th>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Guests</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
            {bookings.map((booking) => {
              const [checkIn, checkOut] = (booking.date_range as string).slice(1, -1).split(",");
              return (
                <tr key={booking.id}>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-900">{booking.listing?.title ?? "Listing"}</div>
                    <div className="text-xs text-gray-500">
                      {[booking.listing?.city, booking.listing?.country].filter(Boolean).join(", ")}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-900">{booking.guest?.full_name ?? "--"}</div>
                    <div className="text-xs text-gray-500">{booking.guest?.id}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{formatDateRange(checkIn, checkOut)}</td>
                  <td className="px-4 py-4 text-sm">{booking.guests_count}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                    {formatCurrency(Number(booking.total_price ?? 0), booking.listing?.currency ?? "USD")}
                  </td>
                  <td className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">{booking.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
