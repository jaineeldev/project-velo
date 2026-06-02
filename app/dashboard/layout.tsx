import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { hasCompletedOnboarding } from "@/lib/user-profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOrCreateUser();

  // Route clients to their own dashboard. The middleware also does this
  // when Clerk's session-token role claim is configured, but this DB
  // read is the authoritative guard — Clerk lands users here via
  // NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard regardless of role,
  // and this catches the client before the agency layout/onboarding
  // renders even for a frame.
  const roleRows = await sql`
    SELECT role, suspended_at FROM user_profiles WHERE user_id = ${user.id}
  `;
  if (roleRows[0]?.suspended_at) redirect("/suspended");
  if (roleRows[0]?.role === "client") redirect("/client/dashboard");

  // First-time users get bounced to the welcome flow. Once they submit or
  // skip there, onboarded_at is set and they never see it again.
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
