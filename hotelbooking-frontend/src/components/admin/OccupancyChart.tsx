import type { OccupancyDayDto } from "@/lib/api/types";
import { formatDate, plural } from "@/lib/format";

export function OccupancyChart({ days }: { days: OccupancyDayDto[] }) {
  if (days.length === 0) return null;

  const peak = Math.max(...days.map((day) => day.occupancyRate));
  const summary = `Daily occupancy from ${formatDate(days[0].date)} to ${formatDate(
    days[days.length - 1].date,
  )}. Highest day: ${peak}%.`;

  return (
    <figure>
      <div
        role="img"
        aria-label={summary}
        className="flex h-44 items-end gap-px border-b border-line"
      >
        {days.map((day) => (
          <div
            key={day.date}
            title={`${formatDate(day.date)}: ${plural(day.roomsSold, "room")} of ${day.totalRooms} (${day.occupancyRate}%)`}
            className="flex h-full flex-1 items-end"
          >
            {/* Batang setinggi persen okupansi. Minimal 2px supaya hari kosong tetap tampak. */}
            <div
              className="w-full rounded-t-sm bg-brand"
              style={{ height: `max(2px, ${Math.min(100, day.occupancyRate)}%)` }}
            />
          </div>
        ))}
      </div>
      <figcaption className="mt-2 flex justify-between text-xs text-muted">
        <span>{formatDate(days[0].date)}</span>
        <span>Occupancy per day (0 to 100%)</span>
        <span>{formatDate(days[days.length - 1].date)}</span>
      </figcaption>
    </figure>
  );
}