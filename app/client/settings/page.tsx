import { AppearanceToggle } from "@/components/appearance-toggle";
import { ProfileUploader } from "@/components/profile-uploader";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { checkDeletionEligibility } from "./actions";
import { ProfileForm } from "./profile-form";
import { DangerZone } from "./danger-zone";
import { ExportButton } from "./export-button";

export const dynamic = "force-dynamic";

export default async function ClientSettingsPage() {
  const [user, eligibility] = await Promise.all([
    getOrCreateUser(),
    checkDeletionEligibility(),
  ]);

  const avatarRows = await sql`
    SELECT avatar_url FROM user_profiles WHERE user_id = ${user.id} LIMIT 1
  `;
  const hasAvatar = Boolean(avatarRows[0]?.avatar_url);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Settings
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage your account, appearance, and data.
      </p>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-base font-medium text-foreground">Profile</h2>
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
        <h2 className="text-base font-medium text-foreground">Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Changing your name or email also updates the contact details every
          agency working with you sees on their end.
        </p>
        <ProfileForm />
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-base font-medium text-foreground">Appearance</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how the app looks to you.
        </p>
        <div className="mt-4">
          <AppearanceToggle />
        </div>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-base font-medium text-foreground">Your data</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Download everything that&apos;s been shared with you as a single
          JSON file. Proposals, projects, invoices, and milestones, with the
          agency name attached to each.
        </p>
        <div className="mt-4">
          <ExportButton />
        </div>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="text-base font-medium text-foreground">Danger zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanent. We block deletion while you have active work so you
          can&apos;t accidentally walk away from a proposal that needs your
          decision or an invoice that&apos;s still outstanding.
        </p>
        <DangerZone
          accountEmail={user.email}
          initialBlockers={eligibility.blockers}
        />
      </section>
    </div>
  );
}
