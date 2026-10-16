import type { Metadata } from "next";
import { BookingCard } from "@/components/bookings/BookingCard";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import { getMyBookings } from "@/lib/api/bookings";
import type { BookingDto } from "@/lib/api/types";
import { groupOf } from "@/lib/booking-groups";
import { redirectIfUnauthorized } from "@/lib/auth/guard";
import { requireUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/types";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false },
};

export default async function AccountPage() {
  const session = await requireUser("/account");
  const { user } = session;
  const isGuest = user.roles.includes(ROLES.guest);

  // Akun staf tidak punya booking tamu, jadi tidak memanggil API booking.
  let bookings: BookingDto[] = [];
  if (isGuest) {
    try {
      bookings = await getMyBookings(session.token);
    } catch (error) {
      redirectIfUnauthorized(error, "/account");
      if (!(error instanceof ApiError && error.status === 403)) throw error;
    }
  }

  const active = bookings.filter((b) => groupOf(b) === "active");
  // Menginap berikutnya: booking aktif dengan tanggal check-in paling awal.
  const next = [...active].sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0];

  return (
    <Container className="max-w-3xl py-10 md:py-14">
      <p className="font-script text-3xl text-brand">Welcome back</p>
      <h1 className="mt-1 text-3xl font-bold md:text-4xl">{user.name}</h1>
      <p className="mt-2 text-sm text-muted">{user.email}</p>

      {!isGuest && (
        <p className="mt-8 rounded-md bg-surface px-4 py-3 text-sm">
          You are signed in with a staff account ({user.roles.join(", ")}). Staff tools are added
          in a later part.
        </p>
      )}

      {isGuest && (
        <>
          <section className="mt-10">
            <h2 className="text-lg font-semibold">Your next stay</h2>
            <div className="mt-4">
              {next ? (
                <BookingCard booking={next} />
              ) : (
                <div className="rounded-lg bg-surface px-6 py-10 text-center">
                  <p className="font-semibold">Nothing planned yet</p>
                  <p className="mt-2 text-sm text-muted">
                    Pick your dates and book a room for your next stay.
                  </p>
                  <div className="mt-5">
                    <ButtonLink href="/rooms">Browse rooms</ButtonLink>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: "All bookings", value: bookings.length },
              { label: "Active", value: active.length },
              {
                label: "Completed",
                value: bookings.filter((b) => groupOf(b) === "completed").length,
              },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-brand-soft p-5 text-center">
                <p className="text-3xl font-bold text-brand-dark">{item.value}</p>
                <p className="mt-1 text-sm text-muted">{item.label}</p>
              </div>
            ))}
          </section>

          <div className="mt-8">
            <ButtonLink href="/account/bookings" variant="outline">
              See all bookings
            </ButtonLink>
          </div>
        </>
      )}
    </Container>
  );
}