import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";

export type AppUser = {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
};

// `cache()` dedupes within a single render tree. A typical dashboard request
// hits this from the layout, the page, and any server action helpers; without
// dedup, that's 3+ Clerk + DB round-trips per navigation.
export const getOrCreateUser = cache(async (): Promise<AppUser> => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const primary = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId,
  );
  const email =
    primary?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("Clerk user has no email address");

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  const rows = await sql`
    INSERT INTO users (clerk_id, email, name)
    VALUES (${clerkUser.id}, ${email}, ${name})
    ON CONFLICT (clerk_id) DO UPDATE SET email = EXCLUDED.email
    RETURNING id, clerk_id, email, name
  `;

  return rows[0] as AppUser;
});
