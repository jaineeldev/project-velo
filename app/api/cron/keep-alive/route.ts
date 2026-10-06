import { sql } from "@/lib/db";

// Daily keep-alive for the Supabase free tier, which pauses a project after
// ~7 days without database activity. A paused project's hostname stops
// resolving, middleware's getUser() hangs on it, and the whole site 504s.
// Scheduled in vercel.json. Vercel Cron sends `Authorization: Bearer
// $CRON_SECRET`, so anything else is turned away before touching the DB.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // A real table read rather than `select 1`, so it registers as activity.
    await sql`select count(*) from users`;
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[cron:keep-alive] database ping failed", err);
    return new Response("Database ping failed", { status: 500 });
  }
}
