"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/staff", label: "Today" },
  { href: "/staff/bookings", label: "Bookings" },
  { href: "/staff/rooms", label: "Rooms" },
];

export function StaffNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Front desk" className="flex flex-wrap gap-2">
      {links.map((link) => {
        const active =
          link.href === "/staff" ? pathname === "/staff" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              active
                ? "border-brand bg-brand text-white"
                : "border-line bg-white text-ink hover:border-brand hover:text-brand",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}