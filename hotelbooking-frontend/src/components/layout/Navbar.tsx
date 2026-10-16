"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { logoutAction } from "@/lib/auth/actions";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Container } from "./Container";

export type NavUser = { name: string; isGuest: boolean; isStaff: boolean };

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={cn(
          "text-sm font-semibold text-ink hover:text-brand",
          className,
        )}
      >
        Sign out
      </button>
    </form>
  );
}

export function Navbar({ user }: { user: NavUser | null }) {
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

  const firstName = user?.name.split(" ")[0];

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

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <>
                {user.isStaff && (
                  <Link href="/staff" className="text-sm font-semibold hover:text-brand">
                    Front desk
                  </Link>
                )}
                {user.isGuest && (
                  <Link
                    href="/account/bookings"
                    className="text-sm font-semibold hover:text-brand"
                  >
                    My bookings
                  </Link>
                )}
                <Link
                  href="/account"
                  className="text-sm text-muted hover:text-brand"
                >
                  Hi, {firstName}
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm font-semibold hover:text-brand"
              >
                Sign in
              </Link>
            )}
            <ButtonLink href="/rooms">Book now</ButtonLink>
          </div>

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
              <li className="border-t border-line pt-2">
                {user ? (
                  <>
                    {user.isStaff && (
                      <Link
                        href="/staff"
                        onClick={() => setOpen(false)}
                        className="block py-3 text-base font-semibold"
                      >
                        Front desk
                      </Link>
                    )}
                    {user.isGuest && (
                      <Link
                        href="/account/bookings"
                        onClick={() => setOpen(false)}
                        className="block py-3 text-base font-semibold"
                      >
                        My bookings
                      </Link>
                    )}
                    <div className="flex items-center justify-between py-3">
                      <Link
                        href="/account"
                        onClick={() => setOpen(false)}
                        className="text-base text-muted"
                      >
                        Hi, {firstName}
                      </Link>
                      <SignOutButton className="text-base" />
                    </div>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block py-3 text-base font-semibold"
                  >
                    Sign in
                  </Link>
                )}
              </li>
            </ul>
            <ButtonLink
              href="/rooms"
              onClick={() => setOpen(false)}
              className="mt-2 w-full"
            >
              Book now
            </ButtonLink>
          </Container>
        </div>
      )}
    </header>
  );
}