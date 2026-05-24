import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-log";

// Agency-side surfaces. A signed-in user with role='client' who lands
// here got there by mis-navigation; redirect before the agency layout
// or onboarding form renders. /onboarding is in this set because it is
// specifically the agency business-details flow — a client should not
// be funnelled through it.
const isAgencyRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/clients(.*)",
  "/projects(.*)",
  "/proposals(.*)",
  "/settings(.*)",
]);

// Client-side surfaces. An agency operator who hits these (stale link,
// hand-edited URL) gets sent back to their own dashboard.
const isClientRoute = createRouteMatcher(["/client/dashboard(.*)"]);

const isShareProposal = createRouteMatcher(["/share/proposal/(.*)"]);
const isShareProject = createRouteMatcher(["/share/project/(.*)"]);
const isSharePath = (req: Parameters<typeof isShareProposal>[0]) =>
  isShareProposal(req) || isShareProject(req);

export default clerkMiddleware(async (auth, req) => {
  // Rate-limit public share pages by IP before any DB access. 30 req/min/IP
  // is generous for legitimate use (clients reloading the page) but cuts off
  // token-enumeration attempts.
  if (isSharePath(req)) {
    const scope = isShareProposal(req) ? "share:proposal" : "share:project";
    const ip = getClientIp(req.headers);
    const result = checkRateLimit(`${scope}:${ip}`, 30, 60_000);
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

    // No-store on share pages: token-keyed content must never be cached by
    // CDNs or browser back/forward navigation.
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.headers.set("Pragma", "no-cache");
    return res;
  }

  if (isAgencyRoute(req) || isClientRoute(req)) {
    // Role lives in user_profiles.role (source of truth) and is mirrored
    // into Clerk publicMetadata.role by the finalize endpoint and the
    // user.* webhooks. To make it readable here without a per-request DB
    // round-trip, publicMetadata is exposed on the session token via
    // Clerk Dashboard → Sessions → Customize session token:
    //
    //     { "metadata": "{{user.public_metadata}}" }
    //
    // Without that dashboard step, sessionClaims.metadata is undefined
    // at runtime: every signed-in user looks like an agency user from
    // here, so a client could reach /dashboard and an agency would be
    // blocked from /client/dashboard. The CHECK constraint on
    // user_profiles.role remains the hard guard at the data layer; this
    // middleware is the UX guard on top of it.
    //
    // Token-refresh note: after the finalize endpoint writes
    // publicMetadata, the user's existing JWT keeps the old claim until
    // Clerk refreshes it (~60s). For roughly one minute after a fresh
    // client sign-up the redirect won't catch /dashboard navigations.
    // Acceptable in practice — the finalize handler lands clients on
    // /share/proposal/<token>, not on agency routes.
    const { sessionClaims } = await auth.protect();
    const role = sessionClaims?.metadata?.role;

    // Both checks are *positive* — we only redirect when the JWT
    // carries an explicit role. An undefined role (claim not configured
    // in the Clerk Dashboard, or the JWT is still pre-finalize during
    // the cookie-refresh window) falls through to the destination's
    // own server-side guard. This avoids a redirect loop in the
    // safety-net path:
    //
    //   client w/ stale JWT navigates to /dashboard
    //     → dashboard layout redirects to /onboarding
    //     → /onboarding guard sees DB role='client' → /client/dashboard
    //     → if this check were "role !== 'client'", middleware would
    //       bounce them back to /dashboard → loop forever.
    //
    // With "role === 'agency'" the stale-JWT user reaches
    // /client/dashboard, the server-side guard there matches DB role
    // 'client', and the page renders.
    if (role === "client" && isAgencyRoute(req)) {
      return NextResponse.redirect(new URL("/client/dashboard", req.url));
    }
    if (role === "agency" && isClientRoute(req)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
