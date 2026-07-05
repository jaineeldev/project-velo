import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Inbox, ShieldOff } from "lucide-react";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { cn, focusRing } from "@/lib/utils";
import { SuspendButtons } from "./suspend-buttons";

export const dynamic = "force-dynamic";

type UserDetail = {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  created_at: string;
  role: "agency" | "client" | null;
  business_name: string | null;
  abn: string | null;
  phone: string | null;
  website: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
  onboarded_at: string | null;
  suspended_at: string | null;
};

type EventRow = {
  id: string;
  description: string;
  event_type: string | null;
  created_at: string;
  title: string;
  proposal_id: string;
};

type ClientProposalRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  total_amount: string | number;
  company_name: string | null;
};

function shortDate(value: string | null): string {
  if (!value) return "·";
  return new Date(value).toISOString().slice(0, 10);
}

function shortDateTime(value: string): string {
  return new Date(value).toISOString().replace("T", " ").slice(0, 16);
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: { clerkId: string };
}) {
  await requireAdmin("/admin/users/[clerkId]");

  const clerkId = decodeURIComponent(params.clerkId);

  const userRaw = await sql`
    SELECT
      u.id,
      u.clerk_id,
      u.email,
      u.name,
      u.created_at,
      up.role,
      up.business_name,
      up.abn,
      up.phone,
      up.website,
      up.street,
      up.city,
      up.state,
      up.postcode,
      up.onboarded_at,
      up.suspended_at
    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE u.clerk_id = ${clerkId}
    LIMIT 1
  `;
  const userRows = userRaw as unknown as UserDetail[];

  if (userRows.length === 0) notFound();
  const user = userRows[0];

  const isAgency = user.role === "agency";
  const isClient = user.role === "client";

  // Run all agency-side count queries unconditionally. For a client user
  // these return 0 (no proposals/projects/invoices/clients owned by them),
  // which is fine and saves a conditional branch in the type system.
  const [
    [proposalCountRow],
    [projectCountRow],
    [invoiceCountRow],
    [clientCountRow],
    recentEventsRaw,
  ] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM proposals WHERE user_id = ${user.id}`,
    sql`SELECT COUNT(*)::int AS count FROM projects WHERE user_id = ${user.id}`,
    sql`SELECT COUNT(*)::int AS count FROM invoices WHERE user_id = ${user.id}`,
    sql`SELECT COUNT(*)::int AS count FROM clients WHERE user_id = ${user.id}`,
    sql`
      SELECT pe.id, pe.description, pe.event_type, pe.created_at, p.title, p.id AS proposal_id
      FROM proposal_events pe
      JOIN proposals p ON p.id = pe.proposal_id
      WHERE p.user_id = ${user.id}
      ORDER BY pe.created_at DESC
      LIMIT 15
    `,
  ]);
  const recentEvents = recentEventsRaw as unknown as EventRow[];

  // Client side: proposals shared with this email. Only run for client
  // users (and only used in the client-side render branch).
  const clientProposalsRaw = isClient
    ? await sql`
        SELECT p.id, p.title, p.status, p.created_at, p.total_amount, c.company_name
        FROM proposals p
        JOIN clients c ON c.id = p.client_id
        WHERE LOWER(c.email) = LOWER(${user.email})
        ORDER BY p.created_at DESC
        LIMIT 25
      `
    : [];
  const clientProposals = clientProposalsRaw as ClientProposalRow[];

  const proposalCount = proposalCountRow.count as number;
  const projectCount = projectCountRow.count as number;
  const invoiceCount = invoiceCountRow.count as number;
  const clientCount = clientCountRow.count as number;

  const addressLines = [
    user.street,
    [user.city, user.state, user.postcode].filter(Boolean).join(" "),
  ].filter(Boolean);

  return (
    <div className="px-10 py-10">
      <Link
        href="/admin/users"
        className={cn(
          "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground",
          focusRing,
        )}
      >
        <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
        Back to users
      </Link>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
            {user.name || user.email}
          </h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {user.email}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2">
            {user.suspended_at ? <SuspendedBadge /> : null}
            <RoleBadge role={user.role} />
          </div>
          <SuspendButtons
            clerkId={user.clerk_id}
            isSuspended={Boolean(user.suspended_at)}
          />
        </div>
      </header>

      {user.suspended_at ? (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
          <ShieldOff
            aria-hidden
            className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
          />
          <div className="min-w-0">
            <p className="font-medium text-foreground">Account suspended</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Since {shortDateTime(user.suspended_at)}. The user is redirected
              to /suspended on every protected route until unsuspended.
            </p>
          </div>
        </div>
      ) : null}

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Field label="Clerk ID" mono value={user.clerk_id} />
        <Field label="Joined" value={shortDate(user.created_at)} />
        <Field
          label="Onboarded"
          value={user.onboarded_at ? shortDate(user.onboarded_at) : "Not yet"}
        />
        {isAgency ? (
          <>
            <Field label="Business name" value={user.business_name ?? "·"} />
            <Field label="ABN" mono value={user.abn ?? "·"} />
            <Field label="Phone" value={user.phone ?? "·"} />
            <Field label="Website" value={user.website ?? "·"} />
            <Field
              label="Address"
              value={addressLines.length ? addressLines.join(", ") : "·"}
              span={2}
            />
          </>
        ) : null}
      </section>

      {isAgency ? (
        <section className="mt-10">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Activity totals
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Clients" value={clientCount} />
            <Stat label="Proposals" value={proposalCount} />
            <Stat label="Projects" value={projectCount} />
            <Stat label="Invoices" value={invoiceCount} />
          </div>
        </section>
      ) : null}

      {isAgency ? (
        <section className="mt-10">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Recent proposal events
          </h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
            {recentEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/60">
                  <Inbox
                    aria-hidden
                    className="h-5 w-5 text-muted-foreground"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  No proposal activity yet.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentEvents.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex items-center gap-4 px-5 py-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {ev.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {ev.event_type ?? "event"} · {ev.description}
                      </p>
                    </div>
                    <time className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {shortDateTime(ev.created_at)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : null}

      {isClient ? (
        <section className="mt-10">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Proposals shared with this client
          </h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
            {clientProposals.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/60">
                  <Inbox
                    aria-hidden
                    className="h-5 w-5 text-muted-foreground"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  No proposals linked to this email.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Title</th>
                    <th className="px-5 py-3 font-medium">Company</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                    <th className="px-5 py-3 text-right font-medium">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clientProposals.map((p) => (
                    <tr key={p.id} className="hover:bg-accent/40">
                      <td className="px-5 py-3 font-medium text-foreground">
                        {p.title}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {p.company_name ?? "·"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {p.status}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-xs tabular-nums text-muted-foreground">
                        {Number(p.total_amount).toLocaleString("en-AU", {
                          style: "currency",
                          currency: "AUD",
                        })}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-xs tabular-nums text-muted-foreground">
                        {shortDate(p.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  span,
}: {
  label: string;
  value: string;
  mono?: boolean;
  span?: number;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card px-4 py-3",
        span === 2 ? "lg:col-span-2" : "",
      )}
    >
      <div className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 truncate text-sm text-foreground",
          mono ? "font-mono tabular-nums" : "",
        )}
        title={value}
      >
        {value}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function SuspendedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/15 px-2 py-1 text-xs font-medium uppercase tracking-wider text-foreground">
      <ShieldOff aria-hidden className="h-3 w-3 text-destructive" />
      Suspended
    </span>
  );
}

function RoleBadge({ role }: { role: "agency" | "client" | null }) {
  if (!role) {
    return (
      <span className="rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-muted-foreground">
        No profile
      </span>
    );
  }
  const styles =
    role === "agency"
      ? "border-primary/30 bg-primary/15 text-foreground"
      : "border-border bg-accent/60 text-foreground";
  return (
    <span
      className={cn(
        "rounded-md border px-2 py-1 text-xs font-medium uppercase tracking-wider",
        styles,
      )}
    >
      {role}
    </span>
  );
}
