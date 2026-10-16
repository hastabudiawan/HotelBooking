import { NextResponse, type NextRequest } from "next/server";
import { decodeJwtPayload, isExpired } from "@/lib/auth/jwt";

const SESSION_COOKIE = "pv_session";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? decodeJwtPayload(token) : null;

  if (payload && !isExpired(payload)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

// Hanya jalur ini yang melewati proxy.
export const config = {
  matcher: ["/account/:path*", "/booking/:path*", "/staff/:path*", "/admin/:path*"],
};