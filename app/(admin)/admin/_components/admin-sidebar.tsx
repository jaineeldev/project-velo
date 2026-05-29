"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import {
  Gauge,
  Users,
  Mail,
  Shield,
  UserCircle2,
  LogOut,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Avatar } from "@/components/avatar";
import { cn, focusRing } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon };

const navItems: NavItem[] = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/waitlist", label: "Waitlist", icon: Mail },
  { href: "/admin/security", label: "Security", icon: Shield },
  { href: "/admin/profile", label: "Profile", icon: UserCircle2 },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-14 items-center justify-between border-b border-border px-5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="h-2 w-2 rounded-full bg-primary"
          />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Velo
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Ops
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-md py-2 pl-4 pr-3 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
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
                    ? "text-foreground"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <AdminUserCard />

      <div className="space-y-1 border-t border-border p-3">
        <Link
          href="/dashboard"
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground",
            focusRing,
          )}
        >
          <ArrowUpRight aria-hidden className="h-4 w-4 shrink-0" />
          Back to app
        </Link>
        <SignOutButton>
          <button
            type="button"
            aria-label="Sign out"
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground",
              focusRing,
            )}
          >
            <LogOut aria-hidden className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}

function AdminUserCard() {
  const { user, isLoaded } = useUser();
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Operator";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  if (!isLoaded || !user) {
    return (
      <div className="border-t border-border p-3">
        <div className="h-10" />
      </div>
    );
  }

  return (
    <div className="border-t border-border p-3">
      <Link
        href="/admin/profile"
        className={cn(
          "flex items-center gap-3 rounded-md px-2 py-2 cursor-pointer transition-colors hover:bg-accent/50",
          focusRing,
        )}
      >
        <Avatar userId={user.id} name={name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {name}
          </div>
          <div className="truncate text-xs text-muted-foreground">{email}</div>
        </div>
      </Link>
    </div>
  );
}
