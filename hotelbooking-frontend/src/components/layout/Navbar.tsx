"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Tutup menu mobile dengan tombol Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="bg-white">
      <Container className="flex h-20 items-center justify-between">
        <Link
          href="/"
          aria-label={`${site.name}, home`}
          onClick={() => setOpen(false)}
        >
          <Image
            src={site.logo}
            alt=""
            width={60}
            height={40}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-10">
            {site.nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "text-sm font-semibold transition-colors hover:text-brand",
                      active ? "text-brand" : "text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <ButtonLink href="/rooms" className="hidden md:inline-flex">
            Book now
          </ButtonLink>

          <button
            type="button"
            className="rounded-md p-2 text-ink md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </Container>

      {open && (
        <div id="mobile-menu" className="border-t border-line md:hidden">
          <Container className="py-4">
            <ul className="flex flex-col">
              {site.nav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block py-3 text-base font-semibold",
                        active ? "text-brand" : "text-ink",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <ButtonLink
              href="/rooms"
              onClick={() => setOpen(false)}
              className="mt-4 w-full"
            >
              Book now
            </ButtonLink>
          </Container>
        </div>
      )}
    </header>
  );
}