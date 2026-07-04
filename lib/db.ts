import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// `{ prepare: false }` is required against Supabase's Transaction pooler
// (pgbouncer in transaction mode) — prepared statements don't survive across
// pooled connections, and queries fail intermittently under load without
// this. See CLAUDE.md §13.
export const sql = postgres(process.env.DATABASE_URL, { prepare: false });
