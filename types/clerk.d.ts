import type { UserRole } from "@/lib/validation";

declare global {
  // Custom JWT claims included in Clerk's session token. Populated by
  // configuring Clerk Dashboard → Sessions → Customize session token with:
  //
  //   { "metadata": "{{user.public_metadata}}" }
  //
  // Without that dashboard customization `metadata` is undefined at
  // runtime and the role-based redirects in middleware.ts fall back to
  // treating everyone as an agency user. See the failure-mode comment in
  // that file.
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: UserRole;
    };
  }
}

export {};
