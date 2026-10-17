import "server-only";

import { apiGet } from "./client";
import type { OccupancyReportDto } from "./types";

export function getOccupancyReport(token: string, from: string, to: string) {
  const query = new URLSearchParams({ from, to });
  return apiGet<OccupancyReportDto>(`/api/admin/reports/occupancy?${query}`, { token });
}