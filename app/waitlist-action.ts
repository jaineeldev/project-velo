"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { sql } from "@/lib/db";
import {
  sendWaitlistConfirmationEmail,
  sendWaitlistEmail,
} from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("That doesn't look like a valid email.")
    .max(254),
});

export type SubmitWaitlistInput = z.infer<typeof waitlistSchema>;

// Public form, no auth. Per-IP rate limit guards against drive-by spam.
// Limit is generous because real signups should comfortably fit under it; the
// only thing being denied is scripted abuse.
const LIMIT_PER_HOUR = 5;

export async function submitWaitlist(input: SubmitWaitlistInput): Promise<void> {
  const parsed = waitlistSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const headerStore = await headers();
  const ip = getClientIp(headerStore);
  const limit = checkRateLimit(`waitlist:${ip}`, LIMIT_PER_HOUR, 60 * 60 * 1000);
  if (!limit.ok) {
    throw new Error(
      `Too many sign-ups from this network. Try again in ${limit.retryAfterSeconds}s.`,
    );
  }

  // Canonical record. ON CONFLICT keeps the form idempotent: re-submitting
  // the same email is a no-op the user can't tell from a fresh signup. A
  // previously unsubscribed address re-subscribes by clearing
  // unsubscribed_at. `(xmax = 0)` is the standard PG trick for distinguishing
  // a fresh INSERT from an ON CONFLICT UPDATE so we only fire the support
  // notification for genuinely new entries.
  const [row] = await sql`
    INSERT INTO waitlist_signups (email, ip)
    VALUES (${parsed.data.email}, ${ip})
    ON CONFLICT (email) DO UPDATE SET unsubscribed_at = NULL
    RETURNING (xmax = 0) AS inserted
  `;
  const inserted = Boolean(row?.inserted);

  // Best-effort emails on fresh inserts only. Neither send failure rolls
  // back the DB row; the broadcast list comes from the table, not the inbox.
  if (inserted) {
    await Promise.allSettled([
      sendWaitlistEmail({ email: parsed.data.email, ip }),
      sendWaitlistConfirmationEmail({ to: parsed.data.email }),
    ]);
  }
}
