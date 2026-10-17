import type { Metadata } from "next";
import Link from "next/link";
import { OccupancyChart } from "@/components/admin/OccupancyChart";
import { Button } from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/Field";
import { ApiError } from "@/lib/api/client";
import { getOccupancyReport } from "@/lib/api/reports";
import type { OccupancyReportDto } from "@/lib/api/types";
import { errorMessage, redirectIfUnauthorized } from "@/lib/auth/guard";
import { ADMIN_ROLES, requireRole } from "@/lib/auth/session";
import { addDays, formatDate, formatRupiah, plural, todayInJakarta } from "@/lib/format";
import { resolveRange } from "@/lib/report-range";

export const metadata: Metadata = { title: "Reports" };

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-brand-dark">{value}</p>
    </div>
  );
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[]; to?: string | string[] }>;
}) {
  const query = await searchParams;
  const session = await requireRole(ADMIN_ROLES, "/admin/reports");

  const today = todayInJakarta();
  const range = resolveRange(query, today);

  let report: OccupancyReportDto | null = null;
  let problem = range.error;

  try {
    report = await getOccupancyReport(session.token, range.from, range.to);
  } catch (error) {
    redirectIfUnauthorized(error, "/admin/reports");
    // Penolakan aturan dari backend (400) ditampilkan sebagai pesan, bukan halaman error.
    if (error instanceof ApiError && error.status === 400) {
      problem = errorMessage(error);
    } else {
      throw error;
    }
  }

  const presets = [
    { label: "Last 7 days", from: addDays(today, -6), to: today },
    { label: "Last 30 days", from: addDays(today, -29), to: today },
    { label: "Next 7 days (forecast)", from: today, to: addDays(today, 6) },
  ];

  return (
    <>
      <h2 className="text-xl font-semibold">Occupancy report</h2>

      <form method="GET" action="/admin/reports" className="mt-5 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="from" className="block text-sm font-semibold">
            From
          </label>
          <input
            id="from"
            name="from"
            type="date"
            required
            defaultValue={range.from}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="to" className="block text-sm font-semibold">
            To
          </label>
          <input id="to" name="to" type="date" required defaultValue={range.to} className={fieldClass} />
        </div>
        <Button type="submit">Show report</Button>
      </form>

      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {presets.map((preset) => (
          <Link
            key={preset.label}
            href={`/admin/reports?from=${preset.from}&to=${preset.to}`}
            className="font-semibold text-brand hover:underline"
          >
            {preset.label}
          </Link>
        ))}
      </p>

      {problem && (
        <p role="alert" className="mt-5 rounded-md bg-surface px-4 py-3 text-sm">
          {problem}
        </p>
      )}

      {report && (
        <>
          <p className="mt-6 text-sm text-muted">
            {formatDate(report.from)} to {formatDate(report.to)} · {plural(report.days.length, "day")} ·{" "}
            {plural(report.totalRooms, "room")}
          </p>

          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <Tile label="Occupancy" value={`${report.occupancyRate}%`} />
            <Tile
              label="Room nights sold"
              value={`${report.roomNightsSold} of ${report.roomNightsAvailable}`}
            />
            <Tile label="Revenue" value={formatRupiah(report.revenue)} />
          </div>

          <div className="mt-8">
            <OccupancyChart days={report.days} />
          </div>

          <details className="mt-8">
            <summary className="cursor-pointer text-sm font-semibold text-brand">
              Daily details
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-lg text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-muted">
                    <th className="py-2 pr-4 font-semibold">Date</th>
                    <th className="py-2 pr-4 font-semibold">Rooms sold</th>
                    <th className="py-2 pr-4 font-semibold">Occupancy</th>
                    <th className="py-2 font-semibold">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {report.days.map((day) => (
                    <tr key={day.date} className="border-b border-line">
                      <td className="py-2 pr-4">{formatDate(day.date)}</td>
                      <td className="py-2 pr-4">
                        {day.roomsSold} / {day.totalRooms}
                      </td>
                      <td className="py-2 pr-4">{day.occupancyRate}%</td>
                      <td className="py-2">{formatRupiah(day.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          <ul className="mt-8 list-disc space-y-1 pl-5 text-sm text-muted">
            <li>Counted: confirmed, checked-in, and checked-out bookings. Pending, cancelled, expired, and no-show bookings are not.</li>
            <li>The check-out date is not a night stayed.</li>
            <li>Revenue is each booking&apos;s total divided evenly across its nights. Future dates are a forecast from confirmed bookings.</li>
            <li>Every room counts as available, including rooms under maintenance.</li>
          </ul>
        </>
      )}
    </>
  );
}