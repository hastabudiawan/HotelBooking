import { CalendarDays, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { BookingDto } from "@/lib/api/types";
import { effectiveStatus } from "@/lib/booking-groups";
import { formatDate, formatDateTime, formatRupiah, hasPassed, plural } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";

export function BookingCard({ booking }: { booking: BookingDto }) {
  const status = effectiveStatus(booking);
  const mustPay =
    status === "Pending" && booking.expiresAt !== null && !hasPassed(booking.expiresAt);

  return (
    <Link
      href={`/account/bookings/${booking.id}`}
      className="group block rounded-lg bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_6px_24px_rgba(0,0,0,0.14)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-wide text-muted">{booking.bookingCode}</p>
          <h2 className="mt-1 text-lg font-semibold text-brand-dark">
            {booking.roomTypeName} room
          </h2>
        </div>
        <StatusBadge status={status} />
      </div>

      <p className="mt-3 flex items-center gap-2 text-sm text-muted">
        <CalendarDays size={16} aria-hidden />
        {formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}
        <span aria-hidden>·</span>
        {plural(booking.nights, "night")}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
        <div>
          <p className="font-semibold">{formatRupiah(booking.totalPrice)}</p>
          {mustPay && booking.expiresAt && (
            <p className="mt-1 text-xs text-amber-800">
              Pay before {formatDateTime(booking.expiresAt)}
            </p>
          )}
        </div>
        <span className="flex items-center gap-1 text-sm font-semibold text-brand group-hover:underline">
          View
          <ChevronRight size={16} aria-hidden />
        </span>
      </div>
    </Link>
  );
}