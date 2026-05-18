import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { getOrCreateUser } from "@/lib/auth";
import { hasCompletedOnboarding } from "@/lib/user-profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // First-time users get bounced to the welcome flow. Once they submit or
  // skip there, onboarded_at is set and they never see it again.
  const user = await getOrCreateUser();
  if (!(await hasCompletedOnboarding(user.id))) redirect("/onboarding");

  return (
    <div className="flex min-h-screen">
      <Sidebar className="hidden md:flex" />
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <MobileNav className="md:hidden" />
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
