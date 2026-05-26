// Next.js 16 route guard — replaces middleware.ts.
// Runs before every matched route. Handles two concerns:
//   1. Unauthenticated users → redirect to /login
//   2. Wrong-role users → redirect to /unauthorized
// Does NOT do business logic. Fast, cheap checks only.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that only ADMIN can access
const ADMIN_ONLY_ROUTES = ["/dashboard/audit", "/dashboard/users"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root to dashboard (or login, if unauthenticated) for better UX
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Build a mutable response so Supabase can write refreshed session cookies
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Create a lightweight Supabase client — reads/writes cookies on the request/response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies onto both the request (for this handler) and response (for browser)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Verify the session — this also refreshes the token if it's near expiry
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Guard: dashboard routes require authentication
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      // No session — redirect to login, preserving the intended destination
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Guard: admin-only routes
    const isAdminRoute = ADMIN_ONLY_ROUTES.some((route) =>
      pathname.startsWith(route),
    );

    if (isAdminRoute) {
      // Fetch the user's role from DB metadata stored in the JWT app_metadata,
      // or fall back to a DB lookup via the session.
      // We store role in the Supabase user's app_metadata on creation for fast proxy access.
      const role = user.app_metadata?.role as string | undefined;

      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  // Auth pages: redirect already-authenticated users to dashboard
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

// Match all routes except static files
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
