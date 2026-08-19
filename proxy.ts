import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic check only — redirects based on cookie presence, not a
// verified session. Every protected Server Action / page still calls
// auth() and re-checks role/status server-side (see lib/auth, and
// app/dashboard/layout.tsx / app/admin/layout.tsx).
const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

export function proxy(request: NextRequest) {
  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) =>
    request.cookies.has(name),
  );

  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
