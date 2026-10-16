import type { BookingStatus } from "@/lib/api/types";

export const statusInfo: Record<BookingStatus, { label: string; className: string }> = {
  Pending: { label: "Awaiting payment", className: "bg-amber-100 text-amber-900" },
  Confirmed: { label: "Confirmed", className: "bg-emerald-100 text-emerald-900" },
  CheckedIn: { label: "Checked in", className: "bg-sky-100 text-sky-900" },
  CheckedOut: { label: "Checked out", className: "bg-surface text-muted" },
  Expired: { label: "Expired", className: "bg-surface text-muted" },
  Cancelled: { label: "Cancelled", className: "bg-red-100 text-red-900" },
  NoShow: { label: "No show", className: "bg-red-100 text-red-900" },
};