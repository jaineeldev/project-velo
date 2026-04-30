import { headers } from "next/headers";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { webhookUserSchema } from "@/lib/validation";

export async function POST(req: Request) {
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
  } catch (err) {
    console.error("Clerk webhook verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "user.created") {
    const { id, email_addresses, first_name, last_name } = event.data;
    const email = email_addresses?.[0]?.email_address;
    const name =
      [first_name, last_name].filter(Boolean).join(" ") || null;

    const result = webhookUserSchema.safeParse({ clerk_id: id, email, name });
    if (!result.success) {
      console.error("Clerk webhook user data failed validation", result.error.issues);
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
}
