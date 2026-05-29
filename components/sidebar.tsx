"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Users,
  Receipt,
  Settings,
  LifeBuoy,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { cn, focusRing } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon };

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/proposals", label: "Proposals", icon: FileText },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/support", label: "Help", icon: LifeBuoy },
];

// Dashboard is the only route that wants strict equality — every other entry
// should stay active on its detail pages (e.g. /dashboard/proposals/abc).
function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Shared inner content. Rendered inside the desktop `<aside>` AND inside the
// mobile Sheet, so brand, nav, and user-card logic isn't duplicated. The
// optional `onNavigate` callback lets the mobile Sheet close itself when the
// user taps a nav link or sign-out.
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-5">
        <span
          aria-hidden
          className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.18)]"
        />
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Velo
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-md py-2 pl-4 pr-3 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                focusRing,
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full transition-colors",
                  active ? "bg-primary" : "bg-transparent",
                )}
              />
              <Icon
                aria-hidden
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <UserCard onSignOut={onNavigate} />
    </div>
  );
}

function UserCard({ onSignOut }: { onSignOut?: () => void }) {
  const { user, isLoaded } = useUser();

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <div className="mt-auto border-t border-border p-3">
      <Link
        href="/dashboard/settings"
        onClick={onSignOut}
        className={cn(
          "flex items-center gap-3 rounded-md px-2 py-2 cursor-pointer transition-colors hover:bg-accent/50",
          focusRing,
        )}
      >
        {isLoaded && user ? (
          <Avatar userId={user.id} name={name} size="sm" />
        ) : (
          <div
            aria-hidden
            className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-accent"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {isLoaded ? name : " "}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {isLoaded ? email : " "}
          </div>
        </div>
      </Link>

      <SignOutButton>
        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out"
          className={cn(
            "mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            focusRing,
          )}
        >
          <LogOut aria-hidden className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </SignOutButton>
    </div>
  );
}

// Desktop sidebar — fixed-width left rail. The mobile Sheet renders
// SidebarContent directly; this wrapper is the desktop chrome. Default
// classes include `flex` so the component is visible on its own; callers
// like the dashboard layout pass `hidden md:flex` to gate it behind a
// breakpoint (tailwind-merge dedupes the display utility).
export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        // h-full inherits the viewport-constrained height from the dashboard
        // layout container (h-screen + overflow-hidden), keeping the sidebar
        // pinned while <main> scrolls.
        "flex h-full w-60 flex-col border-r border-border bg-card",
        className,
      )}
    >
      <SidebarContent />
    </aside>
  );
}
