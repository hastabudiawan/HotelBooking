import "server-only";

import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";

// Token ditolak backend (misalnya kunci JWT di backend berubah, padahal cookie belum kedaluwarsa).
// Minta login ulang. Parameter reauth mencegah halaman login langsung melempar balik.
export function redirectIfUnauthorized(error: unknown, returnTo: string) {
  if (error instanceof ApiError && error.status === 401) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}&reauth=1`);
  }
}

// Pesan untuk pengguna: error dari backend apa adanya, selain itu pesan ramah.
export function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return "We could not reach the server. Please try again in a moment.";
}