import Link from "next/link";
import { formatDate, plural } from "@/lib/format";

export function SearchSummary({
  checkIn,
  checkOut,
  guests,
}: {
  checkIn: string;
  checkOut: string;
  guests: number;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-brand-soft px-5 py-4 text-sm">
      <p>
        <span className="font-semibold">
          {formatDate(checkIn)} to {formatDate(checkOut)}
        </span>
        {" · "}
        {plural(guests, "guest")}
      </p>
      <Link href="/rooms" className="font-semibold text-brand hover:underline">
        Clear search
      </Link>
    </div>
  );
}