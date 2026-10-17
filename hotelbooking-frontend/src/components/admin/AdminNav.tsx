"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/room-types", label: "Room types" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/reports", label: "Reports" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex flex-wrap gap-2">
      {links.map((link) => {
        const active =
          link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
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