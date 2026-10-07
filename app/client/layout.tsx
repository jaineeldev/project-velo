import { redirect } from "next/navigation";
import { ClientSidebar } from "@/components/client-sidebar";
import { ClientMobileNav } from "@/components/client-mobile-nav";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOrCreateUser();

  // Role guard. Middleware only checks that someone is signed in; the role
  // lives in user_profiles, so this DB read is what keeps agency users out.
  const roleRows = await sql`
    SELECT role, suspended_at FROM user_profiles WHERE user_id = ${user.id}
  `;
  if (roleRows[0]?.suspended_at) redirect("/suspended");
  if (roleRows[0]?.role !== "client") redirect("/dashboard");

  return (
    <div className="flex h-screen overflow-hidden">
      <ClientSidebar className="hidden md:flex" />
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <ClientMobileNav className="md:hidden" />
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
