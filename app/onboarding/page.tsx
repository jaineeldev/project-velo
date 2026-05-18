import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/auth";
import { hasCompletedOnboarding } from "@/lib/user-profile";
import { WelcomeForm } from "./welcome-form";

export const metadata = {
  title: "Welcome · whereismyapp",
};

export default async function OnboardingPage() {
  const user = await getOrCreateUser();
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
              whereismyapp
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
