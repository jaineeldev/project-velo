"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { userProfileSchema } from "@/lib/validation";

export type OnboardingInput = {
  businessName: string | null;
  abn: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressPostcode: string | null;
};

// Submit the welcome form. Validates with the same schema as settings so the
// rules match (ABN 11 digits, postcode 4 digits, state enum). The flag is
// stamped atomically with the profile fields — if validation fails we never
// mark the user as onboarded, so they'll see the screen again on next visit.
export async function completeOnboarding(input: OnboardingInput): Promise<void> {
  const result = userProfileSchema.safeParse({
    ...input,
    // Settings-only fields not exposed on the onboarding form. Pass null so
    // the schema doesn't reject the payload.
    phone: null,
    website: null,
  });
  if (!result.success) throw new Error(result.error.issues[0].message);

  const user = await getOrCreateUser();
  const data = result.data;

  await sql`
    INSERT INTO user_profiles (
      user_id, business_name, abn,
      street, city, state, postcode,
      onboarded_at, updated_at
    )
    VALUES (
      ${user.id}, ${data.businessName}, ${data.abn},
      ${data.addressStreet}, ${data.addressCity}, ${data.addressState}, ${data.addressPostcode},
      now(), now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      business_name = EXCLUDED.business_name,
      abn = EXCLUDED.abn,
      street = EXCLUDED.street,
      city = EXCLUDED.city,
      state = EXCLUDED.state,
      postcode = EXCLUDED.postcode,
      onboarded_at = now(),
      updated_at = now()
  `;

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

// Skip without saving any business details. Still stamps onboarded_at so the
// gate doesn't re-trigger. The user can fill these in later from settings.
export async function skipOnboarding(): Promise<void> {
  const user = await getOrCreateUser();

  await sql`
    INSERT INTO user_profiles (user_id, onboarded_at, updated_at)
    VALUES (${user.id}, now(), now())
    ON CONFLICT (user_id) DO UPDATE SET
      onboarded_at = now(),
      updated_at = now()
  `;

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}
