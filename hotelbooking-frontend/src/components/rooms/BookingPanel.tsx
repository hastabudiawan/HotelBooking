import { SearchBox } from "@/components/home/SearchBox";
import { ButtonLink } from "@/components/ui/Button";
import type { RoomAvailability } from "@/lib/api/rooms";
import { formatDate, formatRupiah, plural } from "@/lib/format";

type BookingPanelProps = {
  slug: string;
  pricePerNight: number;
  capacity: number;
  // Null kalau pengunjung belum memilih tanggal.
  search: { checkIn: string; checkOut: string; guests: number } | null;
  availability: RoomAvailability | null;
};

export function BookingPanel({
  slug,
  pricePerNight,
  capacity,
  search,
  availability,
}: BookingPanelProps) {
  const bookingQuery = search
    ? new URLSearchParams({
        roomType: slug,
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        guests: String(search.guests),
      }).toString()
    : "";

  return (
    <aside className="rounded-lg bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] lg:sticky lg:top-24">
      <p className="text-2xl font-semibold">
        {formatRupiah(pricePerNight)}{" "}
        <span className="text-sm font-normal text-muted">/ night</span>
      </p>
      <p className="mt-1 text-sm text-muted">Up to {plural(capacity, "guest")}</p>

      <div className="mt-6">
        <SearchBox
          action={`/rooms/${slug}`}
          submitLabel="Check availability"
          initialCheckIn={search?.checkIn}
          initialCheckOut={search?.checkOut}
          initialGuests={search?.guests}
          layout="stacked"
        />
      </div>

      {availability?.status === "invalid" && (
        <p role="alert" className="mt-5 rounded-md bg-surface px-4 py-3 text-sm">
          {availability.message}
        </p>
      )}

      {availability?.status === "unavailable" && search && (
        <p className="mt-5 rounded-md bg-surface px-4 py-3 text-sm">
          This room is not available from {formatDate(search.checkIn)} to{" "}
          {formatDate(search.checkOut)} for {plural(search.guests, "guest")}. Try
          different dates.
        </p>
      )}

      {availability?.status === "available" && (
        <div className="mt-5 rounded-md bg-brand-soft px-4 py-4 text-sm">
          <p className="font-semibold text-brand-dark">
            {plural(availability.item.availableRooms, "room")} available
          </p>
          <p className="mt-2 text-muted">
            {formatRupiah(availability.item.pricePerNight)} x{" "}
            {plural(availability.item.nights, "night")}
          </p>
          <p className="mt-1 text-lg font-semibold">
            Total {formatRupiah(availability.item.totalPrice)}
          </p>
          <ButtonLink href={`/booking/new?${bookingQuery}`} className="mt-4 w-full">
            Continue to booking
          </ButtonLink>
        </div>
      )}
    </aside>
  );
}