import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/admin/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow public admin paths (login page)
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check session cookie
  const session = request.cookies.get("admin_session");
  if (!session?.value) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate session payload
  try {
    // Edge-runtime safe base64 decode
    const raw = session.value;
    // Add padding if missing
    const padded = raw + "=".repeat((4 - raw.length % 4) % 4);
    const decoded = atob(padded);
    const payload = JSON.parse(decoded);
    if (!payload || payload.role !== "admin") {
      throw new Error("Unauthorized");
    }
  } catch {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("admin_session");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};