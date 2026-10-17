import { addDays, isIsoDate } from "@/lib/format";

export const MAX_REPORT_DAYS = 92;

export type ReportRange = {
  from: string;
  to: string;
  // Terisi kalau masukan pengguna ditolak. from dan to kembali ke bawaan.
  error: string | null;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// Jumlah hari termasuk kedua ujung. Kedua masukan harus tanggal yyyy-MM-dd yang valid.
export function inclusiveDays(from: string, to: string) {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`);
  return Math.round(ms / 86_400_000) + 1;
}

// Bawaan: 7 hari terakhir, berakhir hari ini.
export function resolveRange(
  params: { from?: string | string[]; to?: string | string[] },
  today: string,
): ReportRange {
  const fallback = { from: addDays(today, -6), to: today };

  const from = first(params.from);
  const to = first(params.to);

  // Belum ada masukan: pakai bawaan tanpa pesan.
  if (!from && !to) return { ...fallback, error: null };

  if (!isIsoDate(from) || !isIsoDate(to)) {
    return { ...fallback, error: "Choose a valid start and end date." };
  }
  if (to < from) {
    return { ...fallback, error: "The end date cannot be before the start date." };
  }
  if (inclusiveDays(from, to) > MAX_REPORT_DAYS) {
    return { ...fallback, error: `The range can be at most ${MAX_REPORT_DAYS} days.` };
  }

  return { from, to, error: null };
}