"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/auth-client";
import { useSupabaseUser } from "@/lib/hooks/use-supabase-user";
import {
  LayoutDashboard,
  Settings,
  LifeBuoy,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { cn, focusRing } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon };

const navItems: NavItem[] = [
  { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/settings", label: "Settings", icon: Settings },
  { href: "/client/help", label: "Help", icon: LifeBuoy },
];

function isActive(pathname: string, href: string) {
  if (href === "/client/dashboard") return pathname === "/client/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ClientSidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b border-border px-5">
        <span className="font-display text-lg font-black tracking-tight text-foreground">
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
  const router = useRouter();
  const { user, isLoaded } = useSupabaseUser();

  const name = (user?.user_metadata?.name as string | undefined) || "Account";
  const email = user?.email ?? "";

  async function handleSignOut() {
    onSignOut?.();
    await supabase.auth.signOut();
    router.push("/sign-in");
  }

  return (
    <div className="mt-auto border-t border-border p-3">
      <Link
        href="/client/settings"
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

      <button
        type="button"
        onClick={handleSignOut}
        aria-label="Sign out"
        className={cn(
          "mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
          focusRing,
        )}
      >
        <LogOut aria-hidden className="h-4 w-4 shrink-0" />
        Sign out
      </button>
    </div>
  );
}

export function ClientSidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "flex h-full w-60 flex-col border-r border-border bg-card",
        className,
      )}
    >
      <ClientSidebarContent />
    </aside>
  );
}
