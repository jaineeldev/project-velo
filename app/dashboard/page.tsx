import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import {
  Activity,
  CheckCircle2,
  FilePen,
  FilePlus,
  FolderKanban,
  Mail,
  MailX,
  MessageSquare,
  Receipt,
  RotateCcw,
  Send,
  Users,
  type LucideIcon,
} from "lucide-react";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { dateWeekdayFmt } from "@/lib/format";
import { cn, focusRing } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

// Strip any email-shaped substring from a public-facing event description.
// `proposal_events.description` is operator-facing in the dashboard, but the
// strings are written with the client's email baked in (e.g. "Email delivered
// to jane@acme.com"). For the activity feed surface, render those as "client"
// so the dashboard isn't quietly leaking client addresses on screen.
const EMAIL_RE = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
function redactEmails(description: string): string {
  return description.replace(EMAIL_RE, "client");
}

function formatRelative(date: Date): string {
  const diffSec = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (diffSec < 45) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  const diffMo = Math.round(diffDay / 30);
  if (diffMo < 12) return `${diffMo} month${diffMo === 1 ? "" : "s"} ago`;
  const diffYr = Math.round(diffDay / 365);
  return `${diffYr} year${diffYr === 1 ? "" : "s"} ago`;
}

// proposal_events.description is the only column we have to work from
// (the codebase writes an `event_type` too, but it isn't in the schema yet).
// We pick an icon by keyword-matching the description.
function iconForEvent(description: string): LucideIcon {
  const d = description.toLowerCase();
  if (d.startsWith("proposal approved")) return CheckCircle2;
  if (d.startsWith("proposal sent")) return Send;
  if (d.startsWith("proposal created")) return FilePlus;
  if (d.startsWith("proposal edited")) return FilePen;
  if (d.startsWith("proposal reset")) return RotateCcw;
  if (d.startsWith("client requested changes")) return MessageSquare;
  if (d.startsWith("email delivered")) return Mail;
  if (d.startsWith("email not sent") || d.startsWith("email failed"))
    return MailX;
  return Activity;
}

export default async function DashboardPage() {
  const [clerk, appUser] = await Promise.all([
    currentUser(),
    getOrCreateUser(),
  ]);
  const name =
    clerk?.firstName ||
    clerk?.emailAddresses[0]?.emailAddress.split("@")[0] ||
    "there";

  // Counts + activity feed run in one parallel batch — they don't depend on
  // each other, and proposal/invoice status counts are intentionally not
  // cached (they're the things the dashboard exists to show fresh).
  const [
    [activeProjects],
    [pendingProposals],
    [unpaidInvoices],
    [totalClients],
    eventsRaw,
  ] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM projects WHERE user_id = ${appUser.id} AND status = 'active'`,
    sql`SELECT COUNT(*)::int AS count FROM proposals WHERE user_id = ${appUser.id} AND status IN ('draft', 'sent')`,
    sql`SELECT COUNT(*)::int AS count FROM invoices WHERE user_id = ${appUser.id} AND status = 'unpaid'`,
    sql`SELECT COUNT(*)::int AS count FROM clients WHERE user_id = ${appUser.id}`,
    sql`
      SELECT pe.description, pe.created_at, p.id AS proposal_id, p.title
      FROM proposal_events pe
      JOIN proposals p ON p.id = pe.proposal_id
      WHERE p.user_id = ${appUser.id}
      ORDER BY pe.created_at DESC
      LIMIT 10
    `,
  ]);
  const events = eventsRaw as {
    description: string;
    created_at: string | Date;
    proposal_id: string;
    title: string;
  }[];

  const stats: { label: string; value: number; icon: LucideIcon }[] = [
    {
      label: "Active Projects",
      value: activeProjects.count as number,
      icon: FolderKanban,
    },
    {
      label: "Pending Proposals",
      value: pendingProposals.count as number,
      icon: Send,
    },
    {
      label: "Unpaid Invoices",
      value: unpaidInvoices.count as number,
      icon: Receipt,
    },
    {
      label: "Total Clients",
      value: totalClients.count as number,
      icon: Users,
    },
  ];

  const today = dateWeekdayFmt.format(new Date());

  return (
    <div className="px-10 py-12">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back, {name}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{today}</p>
      </header>

      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-inset ring-primary/15">
                <Icon aria-hidden className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 text-4xl font-bold tracking-tight text-foreground">
                  {value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-base font-medium text-foreground">
          Recent activity
        </h2>

        {events.length === 0 ? (
          <Card className="mt-4 border-dashed shadow-none">
            <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Activity aria-hidden className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                No activity yet. Your latest proposals, projects, and invoices
                will show up here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-4 overflow-hidden">
            <ul className="divide-y divide-border">
              {events.map((ev, i) => {
                const Icon = iconForEvent(ev.description);
                return (
                  <li key={i}>
                    <Link
                      href={`/dashboard/proposals/${ev.proposal_id}`}
                      className={cn(
                        "flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-accent",
                        focusRing,
                      )}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Icon
                          aria-hidden
                          className="h-4 w-4 text-muted-foreground"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {ev.title}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {redactEmails(ev.description)}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatRelative(new Date(ev.created_at))}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}
