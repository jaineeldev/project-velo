import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  sendAuthVerificationEmail,
  sendAuthResetPasswordEmail,
  sendAuthMagicLinkEmail,
} from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-log";

// Bridge endpoint for the Supabase "Send Email" Auth Hook. Supabase Edge
// Functions run on Deno outside the Next.js app, so they can't import
// lib/email.tsx's Resend logic directly — instead, supabase/functions/
// send-email-hook verifies Supabase's webhook signature, builds the
// confirmation URL, and POSTs { to, type, url } here over plain HTTPS.
// This route re-verifies a separate shared secret (AUTH_EMAIL_BRIDGE_SECRET)
// so a stolen/leaked Supabase hook URL alone isn't enough to trigger sends —
// the caller also needs this app-side secret.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  to: z.string().email().max(320),
  type: z.enum(["signup", "recovery", "magiclink", "email_change", "invite", "reauthentication"]),
  url: z.string().url().max(2000),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = await checkRateLimit(`auth-email-bridge:${ip}`, 60, 60_000);
  if (!limit.ok) {
    return new NextResponse("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfterSeconds) },
    });
  }

  const secret = process.env.AUTH_EMAIL_BRIDGE_SECRET;
  const provided = req.headers.get("x-auth-email-secret");
  if (!secret || !provided || provided !== secret) {
    logSecurityEvent({
      event: "auth_email_bridge_denied",
      route: "api/auth/send-email",
      ip,
      outcome: "denied",
      reason: "bad_secret",
    });
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return new NextResponse("Bad request", { status: 400 });
  }
  const { to, type, url } = parsed.data;

  const result = await (async () => {
    switch (type) {
      case "signup":
        return sendAuthVerificationEmail(to, url);
      case "recovery":
        return sendAuthResetPasswordEmail(to, url);
      case "magiclink":
        return sendAuthMagicLinkEmail(to, url);
      // email_change / invite / reauthentication aren't wired to a template
      // yet — email-change lands in §13 Session E, invite and
      // reauthentication aren't used anywhere in the app today. Log rather
      // than silently drop, so a future use of these flows is noticed.
      default:
        logSecurityEvent({
          event: "auth_email_type_unhandled",
          route: "api/auth/send-email",
          ip,
          outcome: "failure",
          meta: { type },
        });
        return { ok: true as const };
    }
  })();

  if (!result.ok) {
    logSecurityEvent({
      event: "auth_email_send_failed",
      route: "api/auth/send-email",
      ip,
      outcome: "failure",
      meta: { type },
    });
    return new NextResponse("Send failed", { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
