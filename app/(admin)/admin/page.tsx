import Link from "next/link";
import {
  Activity,
  FileText,
  FolderKanban,
  Mail,
  Receipt,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { timeAgo } from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ActivityRow = {
  id: string;
  event_type: string | null;
  description: string | null;
  created_at: string;
  proposal_id: string;
  proposal_title: string;
  agency_name: string | null;
  agency_email: string;
};

function shortDateTime(value: string): string {
  return new Date(value).toISOString().replace("T", " ").slice(0, 16);
}

export default async function AdminOverviewPage() {
  await requireAdmin("/admin");

  const [
    [agencyCount],
    [clientCount],
    [waitlistActive],
    [waitlistTotal],
    [securityLast24h],
    [deniedLast24h],
    [proposalsTotal],
    [projectsTotal],
    [invoicesSplit],
    [lastSignup],
    activityRaw,
  ] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM user_profiles WHERE role = 'agency'`,
    sql`SELECT COUNT(*)::int AS count FROM user_profiles WHERE role = 'client'`,
    sql`SELECT COUNT(*)::int AS count FROM waitlist_signups WHERE unsubscribed_at IS NULL`,
    sql`SELECT COUNT(*)::int AS count FROM waitlist_signups`,
    sql`SELECT COUNT(*)::int AS count FROM security_events WHERE created_at > now() - interval '24 hours'`,
    sql`SELECT COUNT(*)::int AS count FROM security_events WHERE created_at > now() - interval '24 hours' AND outcome = 'denied'`,
    sql`SELECT COUNT(*)::int AS count FROM proposals`,
    sql`SELECT COUNT(*)::int AS count FROM projects`,
    sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'paid')::int AS paid,
        COUNT(*) FILTER (WHERE status = 'unpaid')::int AS unpaid,
        COUNT(*)::int AS total
      FROM invoices
    `,
    sql`
      SELECT created_at
      FROM user_profiles
      ORDER BY created_at DESC
      LIMIT 1
    `,
    sql`
      SELECT
        pe.id,
        pe.event_type,
        pe.description,
        pe.created_at,
        p.id AS proposal_id,
        p.title AS proposal_title,
        up.business_name AS agency_name,
        u.email AS agency_email
      FROM proposal_events pe
      JOIN proposals p ON p.id = pe.proposal_id
      JOIN users u ON u.id = p.user_id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      ORDER BY pe.created_at DESC
      LIMIT 10
    `,
  ]);

  const invoiceCounts = invoicesSplit as {
    paid: number;
    unpaid: number;
    total: number;
  };
  const lastSignupAt = (lastSignup?.created_at as string | undefined) ?? null;
  const activity = activityRaw as unknown as ActivityRow[];

  type Tile = {
    href: string;
    label: string;
    value: string;
    sub?: string;
    icon: LucideIcon;
  };

  const primaryTiles: Tile[] = [
    {
      href: "/admin/users?tab=agency",
      label: "Agency users",
      value: (agencyCount.count as number).toLocaleString(),
      icon: Users,
    },
    {
      href: "/admin/users?tab=client",
      label: "Client users",
      value: (clientCount.count as number).toLocaleString(),
      icon: UserCheck,
    },
    {
      href: "/admin/waitlist",
      label: "Waitlist active",
      value: (waitlistActive.count as number).toLocaleString(),
      sub: `${waitlistTotal.count} total`,
      icon: Mail,
    },
    {
      href: "/admin/security",
      label: "Security events 24h",
      value: (securityLast24h.count as number).toLocaleString(),
      sub: `${deniedLast24h.count} denied`,
      icon: ShieldAlert,
    },
  ];

  const platformTiles: Tile[] = [
    {
      href: "/admin",
      label: "Total proposals",
      value: (proposalsTotal.count as number).toLocaleString(),
      icon: FileText,
    },
    {
      href: "/admin",
      label: "Total projects",
      value: (projectsTotal.count as number).toLocaleString(),
      icon: FolderKanban,
    },
    {
      href: "/admin",
      label: "Total invoices",
      value: invoiceCounts.total.toLocaleString(),
      sub: `${invoiceCounts.paid} paid · ${invoiceCounts.unpaid} unpaid`,
      icon: Receipt,
    },
    {
      href: "/admin/users",
      label: "Last signup",
      value: timeAgo(lastSignupAt),
      sub: lastSignupAt
        ? new Date(lastSignupAt).toISOString().slice(0, 10)
        : "No signups yet",
      icon: UserPlus,
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
        {primaryTiles.map((t) => (
          <TileCard key={t.label} tile={t} />
        ))}
      </section>

      <section className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {platformTiles.map((t) => (
          <TileCard key={t.label} tile={t} />
        ))}
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Recent activity
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Last 10 proposal events across all agencies.
            </p>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
          {activity.length === 0 ? (
            <EmptyState
              icon={Activity}
              message="No proposal activity yet."
            />
          ) : (
            <ul className="divide-y divide-border">
              {activity.map((ev) => {
                const agency =
                  ev.agency_name?.trim() || ev.agency_email || "Unknown agency";
                return (
                  <li
                    key={ev.id}
                    className="flex items-start gap-4 px-5 py-3 text-sm"
                  >
                    <div className="mt-1 shrink-0">
                      <span
                        aria-hidden
                        className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {ev.proposal_title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        <span className="font-mono">
                          {ev.event_type ?? "event"}
                        </span>{" "}
                        · {agency}
                      </p>
                    </div>
                    <time className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {shortDateTime(ev.created_at)}
                    </time>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function TileCard({ tile }: { tile: {
  href: string;
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
} }) {
  const { href, label, value, sub, icon: Icon } = tile;
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-foreground/20 hover:bg-accent/40 motion-safe:hover:-translate-y-1",
        focusRing,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon
          aria-hidden
          className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground"
        />
      </div>
      <div>
        <div className="font-mono text-3xl font-semibold tabular-nums tracking-tight text-foreground">
          {value}
        </div>
        {sub ? (
          <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
        ) : null}
      </div>
    </Link>
  );
}

function EmptyState({
  icon: Icon,
  message,
}: {
  icon: LucideIcon;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/60">
        <Icon aria-hidden className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
