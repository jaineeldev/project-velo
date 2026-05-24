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

  // Hard server-side guard against a client landing on the agency
  // onboarding form. The middleware should have already bounced them
  // off /onboarding via role==='client', but that check rides on the
  // session JWT carrying publicMetadata.role. If the JWT is still the
  // pre-finalize one (Clerk's frontend reload hasn't run yet, or the
  // session-token customization isn't wired up in the Clerk Dashboard),
  // the middleware sees an undefined role and lets the request
  // through. This DB read is authoritative and doesn't care about JWT
  // state.
  const roleRows = await sql`
    SELECT role FROM user_profiles WHERE user_id = ${user.id}
  `;
  if (roleRows[0]?.role === "client") redirect("/client/dashboard");

  if (await hasCompletedOnboarding(user.id)) redirect("/dashboard");

  const firstName = user.name?.split(" ")[0] ?? null;

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.18)]"
            />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Velo
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:py-16">
        <WelcomeForm firstName={firstName} />
      </div>
    </main>
  );
}
