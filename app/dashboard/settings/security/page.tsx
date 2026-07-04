import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TwoFactorSettings } from "./two-factor-settings";

export default async function SecuritySettingsPage() {
  await requireUser();

  // Supabase Auth's own `auth.mfa_factors` table is the source of truth for
  // MFA status — unlike Better Auth, there's no `two_factor_enabled` column
  // on our own `users` row to check.
  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.listFactors();
  const verifiedFactor = data?.totp.find((f) => f.status === "verified");

  return (
    <div className="max-w-3xl px-10 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Security
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage two-factor authentication for your account.
      </p>

      <TwoFactorSettings
        initialEnabled={Boolean(verifiedFactor)}
        initialFactorId={verifiedFactor?.id ?? null}
      />
    </div>
  );
}
