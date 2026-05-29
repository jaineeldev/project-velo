import { requireAdmin } from "@/lib/admin-auth";
import { AdminSidebar } from "./_components/admin-sidebar";

// Forced dark always. The admin panel is an internal ops surface, not part
// of the marketing site or the agency dashboard, so it gets its own chrome
// and ignores the user's theme preference. Wrapping the tree in
// `className="dark"` activates the dark CSS variables (Tailwind darkMode is
// class-based) for descendants without flipping the global theme.

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Secondary guard. Middleware is the primary gate; this re-checks at the
  // server-component layer so any future middleware bug can't expose the
  // admin tree. Logs denied attempts and redirects out.
  await requireAdmin("/admin");

  return (
    <div className="dark">
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <AdminSidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
