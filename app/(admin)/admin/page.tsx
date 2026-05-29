import Link from "next/link";
import { Users, UserCheck, Mail, ShieldAlert } from "lucide-react";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { cn, focusRing } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireAdmin("/admin");

  const [
    [agencyCount],
    [clientCount],
    [waitlistActive],
    [waitlistTotal],
    [securityLast24h],
    [deniedLast24h],
  ] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM user_profiles WHERE role = 'agency'`,
    sql`SELECT COUNT(*)::int AS count FROM user_profiles WHERE role = 'client'`,
    sql`SELECT COUNT(*)::int AS count FROM waitlist_signups WHERE unsubscribed_at IS NULL`,
    sql`SELECT COUNT(*)::int AS count FROM waitlist_signups`,
    sql`SELECT COUNT(*)::int AS count FROM security_events WHERE created_at > now() - interval '24 hours'`,
    sql`SELECT COUNT(*)::int AS count FROM security_events WHERE created_at > now() - interval '24 hours' AND outcome = 'denied'`,
  ]);

  const tiles = [
    {
      href: "/admin/users?tab=agency",
      label: "Agency users",
      value: agencyCount.count as number,
      icon: Users,
    },
    {
      href: "/admin/users?tab=client",
      label: "Client users",
      value: clientCount.count as number,
      icon: UserCheck,
    },
    {
      href: "/admin/waitlist",
      label: "Waitlist active",
      value: waitlistActive.count as number,
      sub: `${waitlistTotal.count} total`,
      icon: Mail,
    },
    {
      href: "/admin/security",
      label: "Security events 24h",
      value: securityLast24h.count as number,
      sub: `${deniedLast24h.count} denied`,
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="px-10 py-10">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Operator view. Read-only across the board.
        </p>
      </header>

      <section className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ href, label, value, sub, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              "group flex flex-col gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-accent/40",
              focusRing,
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </span>
              <Icon
                aria-hidden
                className="h-4 w-4 text-muted-foreground group-hover:text-foreground"
              />
            </div>
            <div>
              <div className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                {value.toLocaleString()}
              </div>
              {sub ? (
                <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
              ) : null}
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
