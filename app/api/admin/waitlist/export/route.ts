import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { logSecurityEvent } from "@/lib/security-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SignupRow = {
  email: string;
  created_at: string;
  unsubscribed_at: string | null;
};

// CSV-escape a field. Doubles embedded quotes and wraps in quotes when the
// value contains comma, quote, CR, or LF. Strips leading characters that
// Excel treats as formulas to neutralise CSV-injection attempts from
// hand-crafted email addresses.
function csvField(raw: string): string {
  const stripped = raw.replace(/^[=+\-@\t\r]+/, "");
  if (/[",\r\n]/.test(stripped)) {
    return `"${stripped.replace(/"/g, '""')}"`;
  }
  return stripped;
}

export async function GET(req: Request) {
  await requireAdmin("/api/admin/waitlist/export");

  const url = new URL(req.url);
  const include = url.searchParams.get("include") === "all" ? "all" : "active";

  const rowsRaw =
    include === "all"
      ? await sql`
          SELECT email, created_at, unsubscribed_at
          FROM waitlist_signups
          ORDER BY created_at ASC
        `
      : await sql`
          SELECT email, created_at, unsubscribed_at
          FROM waitlist_signups
          WHERE unsubscribed_at IS NULL
          ORDER BY created_at ASC
        `;
  const rows = rowsRaw as SignupRow[];

  const header =
    include === "all"
      ? "email,signed_up_at,unsubscribed_at,status\n"
      : "email,signed_up_at\n";

  const body = rows
    .map((r) => {
      if (include === "all") {
        const status = r.unsubscribed_at ? "unsubscribed" : "active";
        return [
          csvField(r.email),
          csvField(new Date(r.created_at).toISOString()),
          csvField(
            r.unsubscribed_at ? new Date(r.unsubscribed_at).toISOString() : "",
          ),
          status,
        ].join(",");
      }
      return [
        csvField(r.email),
        csvField(new Date(r.created_at).toISOString()),
      ].join(",");
    })
    .join("\n");

  const filename = `velo-waitlist-${include}-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  logSecurityEvent({
    event: "admin_export",
    route: "/api/admin/waitlist/export",
    outcome: "success",
    meta: { kind: "waitlist_csv", include, rows: rows.length },
  });

  return new NextResponse(header + body + (body ? "\n" : ""), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
