import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getOrCreateUser } from "@/lib/auth";

// Returns the signed-in client's portable snapshot: every proposal, project,
// invoice, and milestone shared with their email. Agencies' contact records
// (the clients table) are NOT included — those are the agency's data, not
// the user's.
export async function GET() {
  const user = await getOrCreateUser();

  const roleRows = await sql`
    SELECT role FROM user_profiles WHERE user_id = ${user.id}
  `;
  if (roleRows[0]?.role !== "client") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [proposals, projects, invoices, milestones] = (await Promise.all([
    sql`
      SELECT
        p.id, p.title, p.status, p.total_amount, p.created_at,
        u.name AS agency_name
      FROM proposals p
      JOIN clients c ON c.id = p.client_id
      JOIN users u ON u.id = p.user_id
      WHERE LOWER(c.email) = LOWER(${user.email})
        AND p.status <> 'draft'
      ORDER BY p.created_at DESC
    `,
    sql`
      SELECT
        pr.id, pr.title, pr.status, pr.created_at,
        u.name AS agency_name
      FROM projects pr
      JOIN clients c ON c.id = pr.client_id
      JOIN users u ON u.id = pr.user_id
      WHERE LOWER(c.email) = LOWER(${user.email})
      ORDER BY pr.created_at DESC
    `,
    sql`
      SELECT
        i.id, i.project_id, i.total_amount, i.gst_amount, i.status,
        i.due_date, i.created_at, u.name AS agency_name
      FROM invoices i
      JOIN clients c ON c.id = i.client_id
      JOIN users u ON u.id = i.user_id
      WHERE LOWER(c.email) = LOWER(${user.email})
      ORDER BY i.created_at DESC
    `,
    sql`
      SELECT
        m.id, m.proposal_id, m.title, m.description, m.amount, m.status,
        m.created_at
      FROM milestones m
      JOIN proposals p ON p.id = m.proposal_id
      JOIN clients c ON c.id = p.client_id
      WHERE LOWER(c.email) = LOWER(${user.email})
        AND p.status <> 'draft'
      ORDER BY m.created_at DESC
    `,
  ])) as [
    Record<string, unknown>[],
    Record<string, unknown>[],
    Record<string, unknown>[],
    Record<string, unknown>[],
  ];

  const payload = {
    exported_at: new Date().toISOString(),
    account: {
      name: user.name,
      email: user.email,
    },
    proposals,
    projects,
    invoices,
    milestones,
  };

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="velo-export-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
