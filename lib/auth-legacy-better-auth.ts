// LEGACY — Better Auth instance, kept in place (untouched) only so
// app/api/auth/[[...all]]/route.ts still compiles and the old auth path
// remains a cold rollback option during the Supabase cutover (§13). Nothing
// in the live app calls into this anymore — lib/auth.ts's getSessionUser()/
// requireUser() are now backed by Supabase Auth instead.
//
// Moved verbatim out of lib/auth.ts in §13 Session C. Delete this file (and
// the catch-all route that imports it, and the better-auth/@better-auth/infra
// packages) in §13 Session F once Supabase Auth has been stable in prod for
// 7 days. See CLAUDE.md §13.2 Session F.
import { betterAuth } from "better-auth";
import { magicLink, twoFactor } from "better-auth/plugins";
import { dash } from "@better-auth/infra";
import { Pool } from "@neondatabase/serverless";
import {
  sendAuthResetPasswordEmail,
  sendAuthVerificationEmail,
  sendAuthMagicLinkEmail,
} from "@/lib/email";

// Better Auth needs a pg-compatible Pool speaking the Postgres wire protocol.
// Neon's `Pool` only works against a Neon host — now that DATABASE_URL points
// at Supabase, this pool will fail to connect. That's expected and harmless:
// nothing calls `auth.api.*` anymore, so the pool is never actually used at
// runtime. It's kept only so this file still type-checks and builds.
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
      const result = await sendAuthResetPasswordEmail(user.email, url);
      if (!result.ok) {
        console.log(
          JSON.stringify({
            ts: new Date().toISOString(),
            event: "auth_reset_password_send_failed",
            reason: result.reason,
          }),
        );
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const result = await sendAuthVerificationEmail(user.email, url);
      if (!result.ok) {
        console.log(
          JSON.stringify({
            ts: new Date().toISOString(),
            event: "auth_verify_email_send_failed",
            reason: result.reason,
          }),
        );
      }
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
        const result = await sendAuthMagicLinkEmail(email, url);
        if (!result.ok) {
          console.log(
            JSON.stringify({
              ts: new Date().toISOString(),
              event: "auth_magic_link_send_failed",
              reason: result.reason,
            }),
          );
        }
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
