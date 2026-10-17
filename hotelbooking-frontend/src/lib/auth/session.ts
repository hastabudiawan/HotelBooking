import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { decodeJwtPayload, isExpired, rolesOf } from "./jwt";
import { ROLES, type AuthResponse, type Session } from "./types";

export const SESSION_COOKIE = "pv_session";

export async function setSession(auth: AuthResponse) {
  const store = await cookies();
  store.set(SESSION_COOKIE, auth.token, {
    httpOnly: true,
    sameSite: "lax",
    // secure: process.env.NODE_ENV === "production",
    // Bawaan: Secure di produksi. COOKIE_SECURE=false hanya untuk mencoba image produksi lewat http://localhost.
    secure:
      process.env.COOKIE_SECURE !== undefined
        ? process.env.COOKIE_SECURE === "true"
        : process.env.NODE_ENV === "production",
    path: "/",
    // Cookie berakhir bersamaan dengan token.
    expires: new Date(auth.expiresAtUtc),
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

// Dibungkus cache() supaya satu permintaan hanya membaca cookie sekali,
// walaupun dipanggil dari layout dan halaman sekaligus.
export const getSession = cache(async (): Promise<Session | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload || isExpired(payload)) return null;

  const id = Number(payload.sub);
  if (!Number.isInteger(id)) return null;

  return {
    token,
    user: {
      id,
      name: payload.name ?? payload.email ?? "Guest",
      email: payload.email ?? "",
      roles: rolesOf(payload),
    },
  };
});

// Untuk halaman yang butuh login. Kalau belum login, arahkan ke /login lalu kembali ke sini.
export async function requireUser(returnTo: string): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return session;
}

// Untuk halaman khusus peran (resepsionis, admin). Peran yang salah ditampilkan sebagai 404.
export async function requireRole(
  roles: string[],
  returnTo: string,
): Promise<Session> {
  const session = await requireUser(returnTo);
  if (!session.user.roles.some((role) => roles.includes(role))) notFound();
  return session;
}

// Peran yang boleh masuk panel staf.
export const STAFF_ROLES: string[] = [ROLES.receptionist, ROLES.admin];

// Peran yang boleh masuk panel admin.
export const ADMIN_ROLES: string[] = [ROLES.admin];
