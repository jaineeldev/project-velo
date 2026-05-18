import { unstable_cache } from "next/cache";
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

// Cache key for the per-user profile tag. Invalidated from updateProfile via
// revalidateTag(profileTag(userId)) — every read site sees fresh data on the
// next request without us having to plumb cache invalidation through callers.
export const profileTag = (userId: string) => `user-profile:${userId}`;

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const tag = profileTag(userId);
  return unstable_cache(
    async () => {
      const rows = await sql`
        SELECT business_name, abn, street, city, state, postcode, phone, website
        FROM user_profiles
        WHERE user_id = ${userId}
      `;
      if (rows.length === 0) return EMPTY_PROFILE;
      return rows[0] as UserProfile;
    },
    ["user-profile", userId],
    { tags: [tag], revalidate: 3600 },
  )();
}

// Returns true once the user has either submitted or skipped the new-user
// onboarding flow (onboarded_at is set). Used by the dashboard layout to
// redirect first-time users to /onboarding.
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const rows = await sql`
    SELECT onboarded_at
    FROM user_profiles
    WHERE user_id = ${userId}
  `;
  if (rows.length === 0) return false;
  return rows[0].onboarded_at !== null;
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
