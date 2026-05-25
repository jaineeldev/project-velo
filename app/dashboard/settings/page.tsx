import Link from "next/link";
import { ArrowRight, CreditCard } from "lucide-react";
import { AppearanceToggle } from "@/components/appearance-toggle";
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

  return (
    <div className="max-w-3xl px-10 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        Settings
      </h1>

      <section className="mt-10 border-t border-neutral-200 pt-8 dark:border-neutral-800">
        <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          Business profile
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          These details appear on your proposals and invoices, including the
          PDFs you send to clients.
        </p>
        <ProfileForm profile={profile} />
      </section>

      <section className="mt-10 border-t border-neutral-200 pt-8 dark:border-neutral-800">
        <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          Appearance
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Choose how the app looks to you.
        </p>
        <div className="mt-4">
          <AppearanceToggle />
        </div>
      </section>

      <section className="mt-10 border-t border-neutral-200 pt-8 dark:border-neutral-800">
        <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          Subscription &amp; billing
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Manage your plan, payment methods, and invoices.
        </p>
        <div className="mt-4 flex items-start gap-3 rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900/50">
          <CreditCard
            aria-hidden
            className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500 dark:text-neutral-400"
          />
          <div className="text-sm">
            <p className="font-medium text-neutral-800 dark:text-neutral-200">
              Payments are coming soon
            </p>
            <p className="mt-1 text-neutral-500 dark:text-neutral-400">
              We&apos;re still wiring up payments. Until then, your free trial
              runs until you choose a plan — no card on file, no auto-charge.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 border-t border-neutral-200 pt-8 dark:border-neutral-800">
        <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          Help &amp; support
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Found a bug or got feedback? Send it through and we&apos;ll reply to
          you directly.
        </p>
        <Link
          href="/dashboard/support"
          className={cn(
            "mt-4 inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900",
            focusRing,
          )}
        >
          Open Help &amp; support
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </section>

      <section className="mt-10 border-t border-neutral-200 pt-8 dark:border-neutral-800">
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
