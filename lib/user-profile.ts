import { sql } from "@/lib/db";

export type UserProfile = {
  business_name: string | null;
  abn: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  phone: string | null;
  website: string | null;
};

export const EMPTY_PROFILE: UserProfile = {
  business_name: null,
  abn: null,
  street: null,
  city: null,
  state: null,
  postcode: null,
  phone: null,
  website: null,
};

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const rows = await sql`
    SELECT business_name, abn, street, city, state, postcode, phone, website
    FROM user_profiles
    WHERE user_id = ${userId}
  `;
  if (rows.length === 0) return EMPTY_PROFILE;
  return rows[0] as UserProfile;
}

// Render an ABN like "11 222 333 444" — the canonical Australian display form.
export function formatAbn(abn: string | null): string | null {
  if (!abn) return null;
  const digits = abn.replace(/\D/g, "");
  if (digits.length !== 11) return abn;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`;
}

// Single-line address — empty pieces are skipped.
export function formatAddressLine(profile: UserProfile): string | null {
  const parts = [
    profile.street,
    profile.city,
    [profile.state, profile.postcode].filter(Boolean).join(" ") || null,
  ].filter(Boolean);
  return parts.length === 0 ? null : parts.join(", ");
}
