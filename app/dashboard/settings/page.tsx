import { AppearanceToggle } from "@/components/appearance-toggle";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl px-10 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
        Settings
      </h1>

      <section className="mt-10 border-t border-neutral-200 pt-8 dark:border-neutral-800">
        <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          Appearance
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Choose how Velo looks to you.
        </p>
        <div className="mt-4">
          <AppearanceToggle />
        </div>
      </section>
    </div>
  );
}
