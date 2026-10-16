import type { StaffBookingDto } from "@/lib/api/types";
import { StatusBadge } from "@/components/bookings/StatusBadge";
import { effectiveStatus } from "@/lib/booking-groups";
import { formatDate, formatRupiah, plural } from "@/lib/format";
import { checkInAction, checkOutAction, noShowAction } from "@/lib/staff/actions";
import { ActionButton } from "./ActionButton";

export function StaffBookingRow({
  booking,
  today,
}: {
  booking: StaffBookingDto;
  today: string;
}) {
  const status = effectiveStatus(booking);

  const canCheckIn =
    status === "Confirmed" && booking.checkIn <= today && booking.checkOut > today;
  const canNoShow = status === "Confirmed" && booking.checkIn < today;
  const canCheckOut = status === "CheckedIn";
  const dueOut = status === "CheckedIn" && booking.checkOut <= today;

  return (
    <article className="rounded-lg bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-wide text-muted">{booking.bookingCode}</p>
          <h3 className="mt-1 text-lg font-semibold text-brand-dark">{booking.guestName}</h3>
          <p className="text-sm text-muted">{booking.guestEmail}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {dueOut && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              Due out
            </span>
          )}
          <span
            className={
              booking.isPaid
                ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900"
                : "rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted"
            }
          >
            {booking.isPaid ? "Paid" : "Unpaid"}
          </span>
          <StatusBadge status={status} />
        </div>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-muted">Room</dt>
          <dd className="font-semibold">
            {booking.roomNumber} · {booking.roomTypeName}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Stay</dt>
          <dd className="font-semibold">
            {formatDate(booking.checkIn)} to {formatDate(booking.checkOut)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Length</dt>
          <dd className="font-semibold">
            {plural(booking.nights, "night")}, {plural(booking.guestCount, "guest")}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Total</dt>
          <dd className="font-semibold">{formatRupiah(booking.totalPrice)}</dd>
        </div>
      </dl>

      {(canCheckIn || canNoShow || canCheckOut) && (
        <div className="mt-5 flex flex-wrap items-start gap-3 border-t border-line pt-4">
          {canCheckIn && (
            <ActionButton
              action={checkInAction}
              bookingId={booking.id}
              label="Check in"
              pendingLabel="Checking in..."
            />
          )}
          {canCheckOut && (
            <ActionButton
              action={checkOutAction}
              bookingId={booking.id}
              label="Check out"
              pendingLabel="Checking out..."
            />
          )}
          {canNoShow && (
            <ActionButton
              action={noShowAction}
              bookingId={booking.id}
              label="Mark no-show"
              pendingLabel="Saving..."
              variant="outline"
            />
          )}
        </div>
      )}
    </article>
  );
}