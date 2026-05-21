"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { sendWaitlistEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("That doesn't look like a valid email."),
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

  const result = await sendWaitlistEmail({ email: parsed.data.email, ip });

  if (!result.ok) {
    throw new Error(
      "Couldn't save your spot right now. Please try again, or email jaineelk.dev@gmail.com.",
    );
  }
}
