import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-log";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/onboarding(.*)"]);
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

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
