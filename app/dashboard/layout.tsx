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
    // h-screen + overflow-hidden constrains the layout to exactly the viewport
    // so the sidebar stays put while only <main> scrolls internally. With
    // min-h-screen, long pages (e.g. settings) would push the layout taller
    // and the sidebar would slide off the top with the page scroll.
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="hidden md:flex" />
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <MobileNav className="md:hidden" />
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
