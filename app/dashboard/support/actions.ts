"use server";

import { z } from "zod";
import { getOrCreateUser } from "@/lib/auth";
import { sendSupportEmail } from "@/lib/email";

const supportSchema = z.object({
  type: z.enum(["bug", "feedback", "help"]),
  subject: z.string().trim().max(200).nullable(),
  message: z
    .string()
    .trim()
    .min(5, "Please add a few words so we can help.")
    .max(5000, "Message is too long — try trimming it down."),
});

export type SubmitSupportInput = z.infer<typeof supportSchema>;

export async function submitSupport(input: SubmitSupportInput): Promise<void> {
  const parsed = supportSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const user = await getOrCreateUser();

  const result = await sendSupportEmail({
    type: parsed.data.type,
    subject: parsed.data.subject?.trim() || null,
    message: parsed.data.message,
    userName: user.name,
    userEmail: user.email,
    userId: user.id,
  });

  if (!result.ok) {
    // Surface a friendly message and keep the fallback mailto visible on the
    // page so the user always has a way through.
    throw new Error(
      "Could not send your message right now. Please email jaineelk.dev@gmail.com directly.",
    );
  }
}
