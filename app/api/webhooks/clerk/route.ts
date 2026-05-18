import { headers } from "next/headers";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { webhookUserSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-log";

export async function POST(req: Request) {
  // Cheap IP rate-limit before signature verification — Clerk's real
  // webhook traffic is tiny (user.created on signup), so 60/min is well above
  // legitimate use and well below what an attacker would need to be a problem.
  const ip = getClientIp(req.headers);
  const limit = checkRateLimit(`webhook:clerk:${ip}`, 60, 60_000);
  if (!limit.ok) {
    return new Response("Too many requests", {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfterSeconds) },
    });
  }

  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    return new Response("CLERK_WEBHOOK_SIGNING_SECRET not set", { status: 500 });
  }

  const headerList = headers();
  const svixId = headerList.get("svix-id");
  const svixTimestamp = headerList.get("svix-timestamp");
  const svixSignature = headerList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const body = await req.text();

  let event: WebhookEvent;
  try {
    event = new Webhook(secret).verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    logSecurityEvent({
      event: "webhook_signature_invalid",
      route: "api/webhooks/clerk",
      ip,
      outcome: "denied",
    });
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    if (event.type === "user.created") {
      const { id, email_addresses, first_name, last_name } = event.data;
      const email = email_addresses?.[0]?.email_address;
      const name =
        [first_name, last_name].filter(Boolean).join(" ") || null;

      const result = webhookUserSchema.safeParse({ clerk_id: id, email, name });
      if (!result.success) {
        logSecurityEvent({
          event: "webhook_user_data_invalid",
          route: "api/webhooks/clerk",
          ip,
          outcome: "denied",
        });
        return new Response("Invalid user data in webhook payload", { status: 400 });
      }

      const { clerk_id, email: validEmail, name: validName } = result.data;

      await sql`
        INSERT INTO users (clerk_id, email, name)
        VALUES (${clerk_id}, ${validEmail}, ${validName})
        ON CONFLICT (clerk_id) DO NOTHING
      `;
    }

    return new Response("ok", { status: 200 });
  } catch {
    // Don't echo error details — Clerk just needs a non-2xx to retry. Internal
    // DB or runtime failures shouldn't leak through this surface.
    return new Response("Webhook processing failed", { status: 500 });
  }
}
