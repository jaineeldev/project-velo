import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";

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

export default async function DashboardPage() {
  const [clerk, appUser] = await Promise.all([
    currentUser(),
    getOrCreateUser(),
  ]);
  const name =
    clerk?.firstName ||
    clerk?.emailAddresses[0]?.emailAddress.split("@")[0] ||
    "there";

  const [
    [activeProjects],
    [pendingProposals],
    [unpaidInvoices],
    [totalClients],
  ] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM projects WHERE user_id = ${appUser.id} AND status = 'active'`,
    sql`SELECT COUNT(*)::int AS count FROM proposals WHERE user_id = ${appUser.id} AND status IN ('draft', 'sent')`,
    sql`SELECT COUNT(*)::int AS count FROM invoices WHERE user_id = ${appUser.id} AND status = 'unpaid'`,
    sql`SELECT COUNT(*)::int AS count FROM clients WHERE user_id = ${appUser.id}`,
  ]);

  const stats = [
    { label: "Active Projects", value: activeProjects.count as number },
    { label: "Pending Proposals", value: pendingProposals.count as number },
    { label: "Unpaid Invoices", value: unpaidInvoices.count as number },
    { label: "Total Clients", value: totalClients.count as number },
  ];

  const events = (await sql`
    SELECT pe.description, pe.created_at, p.id AS proposal_id, p.title
    FROM proposal_events pe
    JOIN proposals p ON p.id = pe.proposal_id
    WHERE p.user_id = ${appUser.id}
    ORDER BY pe.created_at DESC
    LIMIT 10
  `) as {
    description: string;
    created_at: string | Date;
    proposal_id: string;
    title: string;
  }[];

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="px-10 py-12">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Welcome back, {name}
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          {today}
        </p>
      </header>

      {/* Stats */}
      <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-neutral-200 px-5 py-4 dark:border-neutral-800"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* Recent activity */}
      <section className="mt-10">
        <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
          Recent activity
        </h2>
        {events.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-neutral-200 px-6 py-16 text-center dark:border-neutral-800">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No activity yet. Your latest proposals, projects, and invoices
              will show up here.
            </p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-neutral-200 border-t border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {events.map((ev, i) => (
              <li key={i}>
                <Link
                  href={`/dashboard/proposals/${ev.proposal_id}`}
                  className="flex items-baseline justify-between gap-4 py-3 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {ev.title}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-neutral-500 dark:text-neutral-400">
                      {ev.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-neutral-400 dark:text-neutral-600">
                    {formatRelative(new Date(ev.created_at))}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
