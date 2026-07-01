import Link from "next/link";
import { ArrowRight, CreditCard } from "lucide-react";
import { AppearanceToggle } from "@/components/appearance-toggle";
import { ProfileUploader } from "@/components/profile-uploader";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { cn, focusRing } from "@/lib/utils";
import { checkDeletionEligibility, getProfile } from "./actions";
import { ProfileForm } from "./profile-form";
import { DangerZone } from "./danger-zone";

export default async function SettingsPage() {
  const [profile, user, eligibility] = await Promise.all([
    getProfile(),
    getOrCreateUser(),
    checkDeletionEligibility(),
  ]);

  const avatarRows = await sql`
    SELECT avatar_url FROM user_profiles WHERE user_id = ${user.id} LIMIT 1
  `;
  const hasAvatar = Boolean(avatarRows[0]?.avatar_url);

  return (
    <div className="max-w-3xl px-10 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Settings
      </h1>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-base font-medium text-foreground">
          Profile
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your photo, name, and email. Editable name and email coming later.
        </p>
        <ProfileUploader
          userId={user.clerk_id}
          name={user.name}
          email={user.email}
          initialHasAvatar={hasAvatar}
        />
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-base font-medium text-foreground">
          Business profile
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These details appear on your proposals and invoices, including the
          PDFs you send to clients.
        </p>
        <ProfileForm profile={profile} />
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-base font-medium text-foreground">
          Appearance
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how the app looks to you.
        </p>
        <div className="mt-4">
          <AppearanceToggle />
        </div>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-base font-medium text-foreground">
          Subscription &amp; billing
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your plan, payment methods, and invoices.
        </p>
        <div className="mt-4 flex items-start gap-3 rounded-md border border-dashed border-border bg-muted p-4">
          <CreditCard
            aria-hidden
            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
          />
          <div className="text-sm">
            <p className="font-medium text-foreground">
              Payments are coming soon
            </p>
            <p className="mt-1 text-muted-foreground">
              We&apos;re still wiring up payments. Until then, your free trial
              runs until you choose a plan — no card on file, no auto-charge.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-base font-medium text-foreground">
          Help &amp; support
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Found a bug or got feedback? Send it through and we&apos;ll reply to
          you directly.
        </p>
        <Link
          href="/dashboard/support"
          className={cn(
            "mt-4 inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
            focusRing,
          )}
        >
          Open Help &amp; support
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-base font-medium text-destructive">
          Danger zone
        </h2>
        <DangerZone
          accountEmail={user.email}
          initialBlockers={eligibility.blockers}
        />
      </section>
    </div>
  );
}
