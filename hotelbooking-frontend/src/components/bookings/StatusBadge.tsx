import type { BookingStatus } from "@/lib/api/types";
import { statusInfo } from "@/lib/booking-status";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: BookingStatus }) {
  const info = statusInfo[status];
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-semibold",
        info.className,
      )}
    >
      {info.label}
    </span>
  );
}