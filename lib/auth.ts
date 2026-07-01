import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { betterAuth } from "better-auth";
import { magicLink, twoFactor } from "better-auth/plugins";
import { dash } from "@better-auth/infra";
import { Pool } from "@neondatabase/serverless";

// Better Auth needs a pg-compatible Pool. `sql` from `lib/db` is the HTTP
// driver, fine for app queries but not for the pg protocol Better Auth
// expects. Neon's `Pool` speaks pg over WebSocket, so it drops in here.
// DATABASE_URL absence is caught by `lib/db.ts`; BETTER_AUTH_SECRET absence
// is caught by Better Auth itself at first request. Neither check runs at
// module load, so `next build`'s page-data collection stays happy.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgres://build-placeholder",
});

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
    sendResetPassword: async ({ user, url }) => {
      console.log(
        JSON.stringify({
          ts: new Date().toISOString(),
          event: "auth_reset_password_stub",
          to: user.email,
          url,
        }),
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log(
        JSON.stringify({
          ts: new Date().toISOString(),
          event: "auth_verify_email_stub",
          to: user.email,
          url,
        }),
      );
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    },
  },

  plugins: [
    dash({
      apiKey: process.env.BETTER_AUTH_API_KEY,
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        console.log(
          JSON.stringify({
            ts: new Date().toISOString(),
            event: "auth_magic_link_stub",
            to: email,
            url,
          }),
        );
      },
    }),
    twoFactor({
      schema: {
        user: {
          fields: {
            twoFactorEnabled: "two_factor_enabled",
          },
        },
        twoFactor: {
          modelName: "two_factor",
          fields: {
            userId: "user_id",
            backupCodes: "backup_codes",
            failedVerificationCount: "failed_verification_count",
            lockedUntil: "locked_until",
          },
        },
      },
    }),
  ],

  user: {
    modelName: "users",
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  session: {
    modelName: "session",
    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    cookieCache: {
      enabled: true,
      maxAge: 300,
    },
  },
  account: {
    modelName: "account",
    fields: {
      accountId: "account_id",
      providerId: "provider_id",
      userId: "user_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    modelName: "verification",
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },

  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});

export type AppUser = {
  id: string;
  email: string;
  name: string;
};

// Dedupe within a single render tree — a dashboard request typically hits
// this from the layout, the page, and any server action helpers.
export const getSessionUser = cache(async (): Promise<AppUser | null> => {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? "",
  };
});

export const requireUser = async (): Promise<AppUser> => {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in");
  return user;
};

// TEMPORARY SHIM — remove in Session 3 once every caller has been migrated to
// `requireUser()`. Exists only so the app can build during the Clerk → Better
// Auth cutover; the `clerk_id` field is a stub so type-checks pass. See
// CLAUDE.md §12.2 Session 3 for the migration path.
export type LegacyAppUser = AppUser & { clerk_id: string };

export const getOrCreateUser = async (): Promise<LegacyAppUser> => {
  const user = await requireUser();
  return { ...user, clerk_id: "" };
};
