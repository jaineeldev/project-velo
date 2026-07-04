import {
  FolderKanban,
  Receipt,
  Send,
  Users,
  type LucideIcon,
} from "lucide-react";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";
import { dateWeekdayFmt } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import {
  DashboardSections,
  type DashboardItem,
  type ProjectRow,
  type ProposalRow,
} from "./dashboard-sections";

export default async function DashboardPage() {
  const appUser = await getOrCreateUser();
  const name = appUser.name.split(" ")[0] || appUser.email.split("@")[0] || "there";

  // Counts + lists run in one parallel batch. The four count queries are
  // intentionally not cached: they're exactly the at-a-glance signals the
  // operator opens this page to read fresh.
  const [
    [activeProjects],
    [pendingProposals],
    [unpaidInvoices],
    [totalClients],
    proposals,
    projects,
  ] = (await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM projects WHERE user_id = ${appUser.id} AND status = 'active'`,
    sql`SELECT COUNT(*)::int AS count FROM proposals WHERE user_id = ${appUser.id} AND status IN ('draft', 'sent')`,
    sql`SELECT COUNT(*)::int AS count FROM invoices WHERE user_id = ${appUser.id} AND status = 'unpaid'`,
    sql`SELECT COUNT(*)::int AS count FROM clients WHERE user_id = ${appUser.id}`,
    sql`
      SELECT p.id, p.title, p.status, p.total_amount, p.created_at,
             c.name AS client_name
      FROM proposals p
      JOIN clients c ON c.id = p.client_id
      WHERE p.user_id = ${appUser.id}
        AND p.status <> 'draft'
      ORDER BY p.created_at DESC
    `,
    sql`
      SELECT pr.id, pr.title, pr.status, pr.created_at,
             c.name AS client_name,
             COUNT(m.id)::int AS milestone_count,
             COUNT(m.id) FILTER (WHERE m.status = 'completed')::int
               AS milestones_completed,
             EXISTS (
               SELECT 1 FROM invoices i
               WHERE i.project_id = pr.id
                 AND i.status = 'unpaid'
                 AND i.total_amount > 0
             ) AS has_unpaid_invoice,
             EXISTS (
               SELECT 1 FROM change_requests cr
               WHERE cr.proposal_id = pr.proposal_id
                 AND cr.status = 'pending'
             ) AS has_pending_change_request
      FROM projects pr
      JOIN clients c ON c.id = pr.client_id
      LEFT JOIN milestones m ON m.proposal_id = pr.proposal_id
      WHERE pr.user_id = ${appUser.id}
      GROUP BY pr.id, pr.title, pr.status, pr.created_at, pr.proposal_id, c.name
      ORDER BY pr.created_at DESC
    `,
  ])) as unknown as [
    [{ count: number }],
    [{ count: number }],
    [{ count: number }],
    [{ count: number }],
    ProposalRow[],
    ProjectRow[],
  ];

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

  const allWork: DashboardItem[] = [
    ...proposals.map<DashboardItem>((row) => ({
      kind: "proposal",
      row,
      createdAt: new Date(row.created_at).getTime(),
    })),
    ...projects.map<DashboardItem>((row) => ({
      kind: "project",
      row,
      createdAt: new Date(row.created_at).getTime(),
    })),
  ].sort((a, b) => b.createdAt - a.createdAt);

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

      {allWork.length > 0 && <DashboardSections items={allWork} />}
    </div>
  );
}
