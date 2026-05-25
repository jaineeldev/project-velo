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
    if (event.type === "user.created" || event.type === "user.updated") {
      const { id, email_addresses, first_name, last_name, public_metadata } =
        event.data;
      const email = email_addresses?.[0]?.email_address;
      const name =
        [first_name, last_name].filter(Boolean).join(" ") || null;
      // Role lives in publicMetadata so an authenticated server action is
      // the only writer; the client SDK cannot tamper with it the way it
      // can with unsafeMetadata. Missing or unknown → 'agency' via .catch.
      const role = (public_metadata as { role?: unknown } | null | undefined)
        ?.role;

      const result = webhookUserSchema.safeParse({
        clerk_id: id,
        email,
        name,
        role,
      });
      if (!result.success) {
        logSecurityEvent({
          event: "webhook_user_data_invalid",
          route: "api/webhooks/clerk",
          ip,
          outcome: "denied",
        });
        return new Response("Invalid user data in webhook payload", { status: 400 });
      }

      const {
        clerk_id,
        email: validEmail,
        name: validName,
        role: validRole,
      } = result.data;

      // Insert the canonical user row first so the user_profiles FK
      // resolves. ON CONFLICT updates email/name for user.updated; on
      // user.created the conflict is harmless because the row didn't
      // exist (or was just created by /api/sign-up/client/finalize via
      // getOrCreateUser, in which case the values match).
      //
      // The user_profiles upsert is split by event type to avoid a race
      // with the client sign-up finalize endpoint:
      //
      //   user.created — publicMetadata is the snapshot at user-creation
      //   time, which for a client signup is still empty (finalize hasn't
      //   run yet). So we INSERT ... DO NOTHING: if finalize beat us to
      //   it and stamped role='client', leave it alone.
      //
      //   user.updated — fires after finalize writes publicMetadata, so
      //   the role here is authoritative. UPSERT to keep DB and Clerk in
      //   sync (also covers an admin manually changing role in Clerk).
      const profileUpsert =
        event.type === "user.created"
          ? sql`
              INSERT INTO user_profiles (user_id, role)
              SELECT id, ${validRole} FROM users WHERE clerk_id = ${clerk_id}
              ON CONFLICT (user_id) DO NOTHING
            `
          : sql`
              INSERT INTO user_profiles (user_id, role)
              SELECT id, ${validRole} FROM users WHERE clerk_id = ${clerk_id}
              ON CONFLICT (user_id) DO UPDATE
                SET role = EXCLUDED.role,
                    updated_at = now()
            `;

      // For user.updated on a client user, also sync the email + name into
      // every agency-side clients row that matches their PREVIOUS email.
      // The dashboard joins clients to users by email, so without this sync
      // a client who changes their email would lose access to their work
      // until each agency manually updates the contact. Look up the
      // pre-update state before the users-table upsert so the OLD email is
      // still readable.
      let clientSyncStatement: ReturnType<typeof sql> | null = null;
      if (event.type === "user.updated" && validRole === "client") {
        const existing = await sql`
          SELECT email FROM users WHERE clerk_id = ${clerk_id}
        `;
        const oldEmail = existing[0]?.email as string | undefined;
        if (oldEmail) {
          clientSyncStatement = sql`
            UPDATE clients
            SET email = ${validEmail},
                name = ${validName ?? "Client"}
            WHERE LOWER(email) = LOWER(${oldEmail})
          `;
        }
      }

      const statements = [
        sql`
          INSERT INTO users (clerk_id, email, name)
          VALUES (${clerk_id}, ${validEmail}, ${validName})
          ON CONFLICT (clerk_id) DO UPDATE
            SET email = EXCLUDED.email,
                name = EXCLUDED.name
        `,
        profileUpsert,
      ];
      if (clientSyncStatement) statements.push(clientSyncStatement);

      await sql.transaction(statements);
    }

    return new Response("ok", { status: 200 });
  } catch {
    // Don't echo error details — Clerk just needs a non-2xx to retry. Internal
    // DB or runtime failures shouldn't leak through this surface.
    return new Response("Webhook processing failed", { status: 500 });
  }
}
