import Link from "next/link";
import { Search, Users as UsersIcon } from "lucide-react";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { cn, focusRing } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Role = "agency" | "client";

type UserRow = {
  clerk_id: string;
  email: string;
  name: string | null;
  created_at: string;
  business_name: string | null;
  onboarded_at: string | null;
};

function parseTab(raw: string | undefined): Role {
  return raw === "client" ? "client" : "agency";
}

function shortDate(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { tab?: string; q?: string };
}) {
  await requireAdmin("/admin/users");

  const tab = parseTab(searchParams.tab);
  const query = (searchParams.q ?? "").trim().slice(0, 100);
  const like = query ? `%${query}%` : null;

  const rowsRaw = await sql`
    SELECT
      u.clerk_id,
      u.email,
      u.name,
      u.created_at,
      up.business_name,
      up.onboarded_at
    FROM users u
    JOIN user_profiles up ON up.user_id = u.id
    WHERE up.role = ${tab}
      AND (${like}::text IS NULL OR u.email ILIKE ${like} OR u.name ILIKE ${like})
    ORDER BY u.created_at DESC
    LIMIT 200
  `;
  const rows = rowsRaw as unknown as UserRow[];

  const [agencyCountRow] = await sql`
    SELECT COUNT(*)::int AS count FROM user_profiles WHERE role = 'agency'
  `;
  const [clientCountRow] = await sql`
    SELECT COUNT(*)::int AS count FROM user_profiles WHERE role = 'client'
  `;
  const agencyCount = agencyCountRow.count as number;
  const clientCount = clientCountRow.count as number;

  return (
    <div className="px-10 py-10">
      <header className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Users
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everyone provisioned through Clerk. Read-only.
          </p>
        </div>
      </header>

      <div className="mt-6 flex items-center gap-1 border-b border-border">
        <TabLink
          tab="agency"
          activeTab={tab}
          label="Agency"
          count={agencyCount}
        />
        <TabLink
          tab="client"
          activeTab={tab}
          label="Client"
          count={clientCount}
        />
      </div>

      <form
        method="get"
        className="mt-5 flex items-center gap-2"
        role="search"
      >
        <input type="hidden" name="tab" value={tab} />
        <div className="relative flex-1 max-w-sm">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search name or email"
            aria-label="Search users"
            className={cn(
              "w-full rounded-md border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground",
              focusRing,
            )}
          />
        </div>
        {query ? (
          <Link
            href={`/admin/users?tab=${tab}`}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <div className="mt-5 overflow-hidden rounded-lg border border-border bg-card">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/60">
              <UsersIcon
                aria-hidden
                className="h-5 w-5 text-muted-foreground"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {query ? "No matches." : "No users in this tab yet."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Name</th>
                {tab === "agency" ? (
                  <th className="px-5 py-3 font-medium">Business</th>
                ) : null}
                <th className="px-5 py-3 font-medium">Onboarded</th>
                <th className="px-5 py-3 text-right font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr
                  key={r.clerk_id}
                  className="transition-colors hover:bg-accent/40"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/users/${encodeURIComponent(r.clerk_id)}`}
                      className={cn(
                        "font-medium text-foreground hover:underline",
                        focusRing,
                      )}
                    >
                      {r.email}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {r.name ?? "·"}
                  </td>
                  {tab === "agency" ? (
                    <td className="px-5 py-3 text-muted-foreground">
                      {r.business_name ?? "·"}
                    </td>
                  ) : null}
                  <td className="px-5 py-3 text-muted-foreground">
                    {r.onboarded_at ? (
                      <span className="text-foreground">Yes</span>
                    ) : (
                      <span>No</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-xs tabular-nums text-muted-foreground">
                    {shortDate(r.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {rows.length === 200 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Showing the first 200. Refine with search to see older rows.
        </p>
      ) : null}
    </div>
  );
}

function TabLink({
  tab,
  activeTab,
  label,
  count,
}: {
  tab: Role;
  activeTab: Role;
  label: string;
  count: number;
}) {
  const active = tab === activeTab;
  return (
    <Link
      href={`/admin/users?tab=${tab}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative -mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
        focusRing,
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-md px-1.5 py-0.5 font-mono text-xs tabular-nums",
          active
            ? "bg-primary/15 text-foreground"
            : "bg-accent/60 text-muted-foreground",
        )}
      >
        {count}
      </span>
    </Link>
  );
}
