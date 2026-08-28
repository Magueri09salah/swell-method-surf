import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/server/auth/session";

/**
 * Edge guard for /admin/*.
 *
 * This is a UX and defence-in-depth layer, NOT the security boundary. Server
 * actions are directly invocable and do not necessarily traverse this
 * middleware, so every admin page and action re-checks authorisation
 * server-side. See docs/ARCHITECTURE.md §5.
 *
 * Uses `jose`, which is Web Crypto based and therefore edge-compatible —
 * unlike bcrypt, which must never be imported here.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginRoute = pathname === "/admin/login";
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session && !isLoginRoute) {
    const loginUrl = new URL("/admin/login", request.url);
    // Preserve the intended destination so login can return the coach to it.
    if (pathname !== "/admin") loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isLoginRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
