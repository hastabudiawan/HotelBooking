import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CancelButton } from "@/components/bookings/CancelButton";
import { Countdown } from "@/components/bookings/Countdown";
import { PayForm } from "@/components/bookings/PayForm";
import { StatusBadge } from "@/components/bookings/StatusBadge";
import { Container } from "@/components/layout/Container";
import { ApiError } from "@/lib/api/client";
import { getBooking, getPayments } from "@/lib/api/bookings";
import type { BookingDto, PaymentDto } from "@/lib/api/types";
import { redirectIfUnauthorized } from "@/lib/auth/guard";
import { requireUser } from "@/lib/auth/session";
import {
  formatDate,
  formatDateTime,
  formatRupiah,
  hasPassed,
  plural,
} from "@/lib/format";

export const metadata: Metadata = {
  title: "Booking details",
  robots: { index: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; cancelled?: string }>;
};

export default async function BookingDetailPage({ params, searchParams }: PageProps) {
  const { id: rawId } = await params;
  const query = await searchParams;

  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const returnTo = `/account/bookings/${id}`;
  const session = await requireUser(returnTo);

  let booking: BookingDto | null;
  let payments: PaymentDto[] = [];
  try {
    booking = await getBooking(session.token, id);
    if (booking) payments = await getPayments(session.token, id);
  } catch (error) {
    redirectIfUnauthorized(error, returnTo);
    // Akun staf tidak punya akses ke booking: tampilkan sebagai tidak ditemukan.
    if (error instanceof ApiError && error.status === 403) notFound();
    throw error;
  }

  if (!booking) notFound();

  const isPending = booking.status === "Pending";
  const windowOpen =
    isPending && booking.expiresAt !== null && !hasPassed(booking.expiresAt);
  const canCancel = isPending || booking.status === "Confirmed";

  return (
    <Container className="max-w-3xl py-10 md:py-14">
      {query.paid && (
        <p role="status" className="mb-6 rounded-md bg-emerald-100 px-4 py-3 text-sm text-emerald-900">
          Payment received. Your booking is confirmed. See you soon!
        </p>
      )}
      {query.cancelled && (
        <p role="status" className="mb-6 rounded-md bg-surface px-4 py-3 text-sm">
          Your booking has been cancelled. If you had paid, the payment was refunded.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Booking code</p>
          <h1 className="text-2xl font-bold tracking-wide md:text-3xl">
            {booking.bookingCode}
          </h1>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <section className="mt-8 rounded-lg bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <h2 className="text-xl font-semibold text-brand-dark">
          {booking.roomTypeName} room
        </h2>
        <dl className="mt-5 grid grid-cols-2 gap-y-4 text-sm">
          <dt className="text-muted">Room number</dt>
          <dd className="text-right font-semibold">{booking.roomNumber}</dd>

          <dt className="text-muted">Check-in</dt>
          <dd className="text-right font-semibold">{formatDate(booking.checkIn)}</dd>

          <dt className="text-muted">Check-out</dt>
          <dd className="text-right font-semibold">{formatDate(booking.checkOut)}</dd>

          <dt className="text-muted">Stay</dt>
          <dd className="text-right font-semibold">
            {plural(booking.nights, "night")}, {plural(booking.guestCount, "guest")}
          </dd>

          <dt className="border-t border-line pt-4 text-base font-semibold">Total</dt>
          <dd className="border-t border-line pt-4 text-right text-lg font-bold">
            {formatRupiah(booking.totalPrice)}
          </dd>
        </dl>
      </section>

      {isPending && (
        <section className="mt-6 rounded-lg bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          {windowOpen && booking.expiresAt ? (
            <>
              <div className="mb-5 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Pay within{" "}
                <strong>
                  <Countdown expiresAt={booking.expiresAt} />
                </strong>{" "}
                to keep your room. It is held until {formatDateTime(booking.expiresAt)}.
              </div>
              <PayForm bookingId={booking.id} amount={booking.totalPrice} />
            </>
          ) : (
            <p className="text-sm">
              The payment time for this booking has run out, so the room was released. Please
              make a new booking.
            </p>
          )}
        </section>
      )}

      {canCancel && (
        <section className="mt-6">
          <CancelButton bookingId={booking.id} refundable={booking.status === "Confirmed"} />
        </section>
      )}

      {payments.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Payments</h2>
          <ul className="mt-4 divide-y divide-line rounded-lg border border-line">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">
                    {formatRupiah(payment.amount)} via {payment.method}
                  </p>
                  {payment.paidAt && (
                    <p className="text-xs text-muted">{formatDateTime(payment.paidAt)}</p>
                  )}
                </div>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold">
                  {payment.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}