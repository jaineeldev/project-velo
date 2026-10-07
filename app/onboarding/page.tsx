import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { hasCompletedOnboarding } from "@/lib/user-profile";
import { WelcomeForm } from "./welcome-form";

export const metadata = {
  title: "Welcome",
};

export default async function OnboardingPage() {
  const user = await getOrCreateUser();

  // Guard against a client landing on the agency onboarding form.
  // Middleware only checks that someone is signed in; the role lives in
  // user_profiles, so this DB read is what routes clients away.
  const roleRows = await sql`
    SELECT role, suspended_at FROM user_profiles WHERE user_id = ${user.id}
  `;
  if (roleRows[0]?.suspended_at) redirect("/suspended");
  if (roleRows[0]?.role === "client") redirect("/client/dashboard");

  if (await hasCompletedOnboarding(user.id)) redirect("/dashboard");

  const firstName = user.name?.split(" ")[0] ?? null;

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-4">
          <span className="font-display text-lg font-black tracking-tight text-foreground">
            Velo
          </span>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:py-16">
        <WelcomeForm firstName={firstName} />
      </div>
    </main>
  );
}
