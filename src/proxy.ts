import { NextResponse, type NextRequest } from "next/server";

/**
 * Cheap cookie-presence guard for the admin route + all write endpoints.
 * It never trusts the cookie: every write is re-verified server-side with
 * Better Auth in `requireAdmin()` / `getAdminIdentity()`.
 */
function hasSessionCookie(request: NextRequest) {
  const raw = request.headers.get("cookie") || "";
  return /(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=/.test(raw) ||
    /(?:^|;\s*)(?:__Secure-)?better-auth-session_token=/.test(raw);
}

function isWrite(method: string) {
  return method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!hasSessionCookie(request)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Write endpoints under /api/admin or /api/sections require at least a session cookie.
  if (
    isWrite(request.method) &&
    (pathname.startsWith("/api/admin/") || pathname.startsWith("/api/sections/"))
  ) {
    if (!hasSessionCookie(request)) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized. Sign in at /login to edit this portfolio." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/sections/:path*"],
};
