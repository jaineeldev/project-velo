"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { userProfileSchema } from "@/lib/validation";
import { getUserProfile, type UserProfile } from "@/lib/user-profile";

export async function getProfile(): Promise<UserProfile> {
  const user = await getOrCreateUser();
  return getUserProfile(user.id);
}

export type UpdateProfileInput = {
  businessName: string | null;
  abn: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressPostcode: string | null;
  phone: string | null;
  website: string | null;
};

export async function updateProfile(input: UpdateProfileInput): Promise<void> {
  const result = userProfileSchema.safeParse(input);
  if (!result.success) throw new Error(result.error.issues[0].message);

  const user = await getOrCreateUser();
  const data = result.data;

  await sql`
    INSERT INTO user_profiles (
      user_id, business_name, abn,
      street, city, state, postcode,
      phone, website, updated_at
    )
    VALUES (
      ${user.id}, ${data.businessName}, ${data.abn},
      ${data.addressStreet}, ${data.addressCity}, ${data.addressState}, ${data.addressPostcode},
      ${data.phone}, ${data.website}, now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      business_name = EXCLUDED.business_name,
      abn = EXCLUDED.abn,
      street = EXCLUDED.street,
      city = EXCLUDED.city,
      state = EXCLUDED.state,
      postcode = EXCLUDED.postcode,
      phone = EXCLUDED.phone,
      website = EXCLUDED.website,
      updated_at = now()
  `;

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/proposals", "layout");
  revalidatePath("/dashboard/invoices", "layout");
}
