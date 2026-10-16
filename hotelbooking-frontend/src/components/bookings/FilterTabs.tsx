import Link from "next/link";
import { cn } from "@/lib/utils";

export type FilterKey = "all" | "active" | "completed" | "closed";

type Tab = { key: FilterKey; label: string; count: number };

export function FilterTabs({ tabs, current }: { tabs: Tab[]; current: FilterKey }) {
  return (
    <nav aria-label="Filter bookings" className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = tab.key === current;
        return (
          <Link
            key={tab.key}
            href={tab.key === "all" ? "/account/bookings" : `/account/bookings?filter=${tab.key}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              active
                ? "border-brand bg-brand text-white"
                : "border-line bg-white text-ink hover:border-brand hover:text-brand",
            )}
          >
            {tab.label}
            <span className={cn("ml-2 text-xs", active ? "text-white/80" : "text-muted")}>
              {tab.count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}