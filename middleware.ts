import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-log";

// Route classifiers. Kept as prefix checks — mirroring the createRouteMatcher
// groups from the Clerk-era middleware.
function isAgencyRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/proposals") ||
    pathname.startsWith("/settings")
  );
}

function isClientRoute(pathname: string): boolean {
  return pathname.startsWith("/client/");
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin/");
}

function isShareProposal(pathname: string): boolean {
  return pathname.startsWith("/share/proposal/");
}

function isShareProject(pathname: string): boolean {
  return pathname.startsWith("/share/project/");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate-limit public share pages by IP before any downstream work. 30/min/IP
  // is generous for a client reloading the page but cuts off token-enumeration
  // attempts.
  if (isShareProposal(pathname) || isShareProject(pathname)) {
    const scope = isShareProposal(pathname) ? "share:proposal" : "share:project";
    const ip = getClientIp(req.headers);
    const result = await checkRateLimit(`${scope}:${ip}`, 30, 60_000);
    if (!result.ok) {
      logSecurityEvent({
        event: "rate_limit_blocked",
        route: scope,
        ip,
        outcome: "denied",
        meta: { retry_after: result.retryAfterSeconds },
      });
      return new NextResponse("Too many requests", {
        status: 429,
        headers: { "Retry-After": String(result.retryAfterSeconds) },
      });
    }

    // Token-keyed content must never be cached by CDNs or the browser back/
    // forward store.
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.headers.set("Pragma", "no-cache");
    return res;
  }

  // Auth gate. `updateSession()` revalidates the Supabase session against
  // the Auth server (not just a cookie-presence check) and returns the
  // refreshed response so the browser's cookie stays current. The
  // layout/page reruns `getSessionUser()` for its own authoritative check —
  // this is the cheap "signed in at all" redirect before a protected page
  // even starts rendering.
  const { response, user } = await updateSession(req);
  const isAuthed = Boolean(user);

  if (isAdminRoute(pathname)) {
    if (!isAuthed) {
      const url = new URL("/sign-in", req.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    // Real admin allow-list check happens in `lib/admin-auth.requireAdmin()`.
    // Non-admins hit it and get 404'd; the middleware is only the cheap
    // "signed in at all" gate.
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  }

  if (isAgencyRoute(pathname) || isClientRoute(pathname)) {
    if (!isAuthed) {
      const url = new URL("/sign-in", req.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    // Role enforcement (agency vs client) is handled inside the layouts, which
    // already DB-check `user_profiles.role` authoritatively.
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
