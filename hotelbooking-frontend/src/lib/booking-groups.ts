import type { BookingDto, BookingStatus } from "@/lib/api/types";
import { hasPassed } from "@/lib/format";

export type BookingGroup = "active" | "completed" | "closed";

export const groupLabels: Record<BookingGroup, string> = {
  active: "Active",
  completed: "Completed",
  closed: "Cancelled or expired",
};

export function effectiveStatus(booking: {
  status: BookingStatus;
  expiresAt: string | null;
}): BookingStatus {
  if (
    booking.status === "Pending" &&
    booking.expiresAt !== null &&
    hasPassed(booking.expiresAt)
  ) {
    return "Expired";
  }
  return booking.status;
}

export function groupOf(booking: BookingDto): BookingGroup {
  switch (effectiveStatus(booking)) {
    case "Pending":
    case "Confirmed":
    case "CheckedIn":
      return "active";
    case "CheckedOut":
    case "NoShow":
      return "completed";
    default:
      return "closed";
  }
}
