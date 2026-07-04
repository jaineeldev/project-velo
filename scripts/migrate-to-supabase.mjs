// One-off script for the Neon → Supabase migration (CLAUDE.md §13, Session B).
// Run this locally (not in a sandbox) — it needs real network access to both
// Neon and Supabase, and does two things in order:
//
//   1. Replays every file in db/migrations/*.sql against the Supabase DB,
//      building the schema fresh (Supabase starts empty).
//   2. Copies every row currently in Neon over to Supabase, table by table,
//      in foreign-key-safe order (parents before children).
//
// Requires the `postgres` package: run `npm install postgres` first (this
// becomes lib/db.ts's permanent driver later in Session B anyway, so it's
// not a throwaway dependency).
//
// Reads DATABASE_URL (Neon, still the source at this point) and
// SUPABASE_DB_URL_SESSION_POOLER from .env.local — both must be set.
//
// Safe to re-run: schema files that are already recorded in the `migrations`
// ledger are skipped (checked against Supabase before each file runs), and
// every data INSERT uses ON CONFLICT DO NOTHING — so re-running after a
// partial failure just picks up where it left off.

import postgres from "postgres";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

// Load .env.local the same way scripts/migrate.mjs does.
const env = readFileSync(join(root, ".env.local"), "utf8");
for (const line of env.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const NEON_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.SUPABASE_DB_URL_SESSION_POOLER;

if (!NEON_URL) {
  console.error("DATABASE_URL (Neon) is not set in .env.local");
  process.exit(1);
}
if (!SUPABASE_URL) {
  console.error("SUPABASE_DB_URL_SESSION_POOLER is not set in .env.local");
  process.exit(1);
}
if (!NEON_URL.includes("neon.tech")) {
  console.error(
    "DATABASE_URL doesn't look like a Neon URL — refusing to run. " +
      "This script expects DATABASE_URL to still point at Neon (the source), " +
      "and SUPABASE_DB_URL_SESSION_POOLER to be the destination.",
  );
  process.exit(1);
}

const neonSql = postgres(NEON_URL, { ssl: "require", prepare: false });
const supaSql = postgres(SUPABASE_URL, { prepare: false });

console.log("=== 1. Applying schema migrations to Supabase ===");
const migrationsDir = join(root, "db", "migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

await supaSql.unsafe(`
  CREATE TABLE IF NOT EXISTS migrations (
    filename text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )
`);
const alreadyApplied = new Set(
  (await supaSql.unsafe(`SELECT filename FROM migrations`)).map((r) => r.filename),
);

let appliedCount = 0;
for (const file of files) {
  if (alreadyApplied.has(file)) {
    console.log(`· ${file} (already applied, skipping)`);
    continue;
  }
  console.log(`→ ${file}`);
  const text = readFileSync(join(migrationsDir, file), "utf8");
  const statements = text
    .split(/;\s*\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    await supaSql.unsafe(stmt);
  }
  await supaSql.unsafe(
    `INSERT INTO migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING`,
    [file],
  );
  appliedCount++;
}
console.log(`✓ ${appliedCount} new migration files applied (${files.length - appliedCount} already done)\n`);

console.log("=== 2. Copying data (parents before children) ===");
const tableOrder = [
  "users",
  "user_profiles",
  "clients",
  "proposals",
  "line_items",
  "milestones",
  "deliverables",
  "projects",
  "invoices",
  "time_entries",
  "change_requests",
  "proposal_events",
  "proposal_comments",
  "waitlist_signups",
  "security_events",
  // Better Auth's own tables — real rows unlikely (no completed sign-ups
  // yet), copied anyway for completeness while Better Auth code still exists
  // in the tree per the §13 rollback posture.
  "session",
  "account",
  "verification",
  "two_factor",
];

let totalRows = 0;
for (const table of tableOrder) {
  const rows = await neonSql.unsafe(`SELECT * FROM "${table}"`);
  if (rows.length === 0) {
    console.log(`· ${table}: 0 rows, skipping`);
    continue;
  }
  const columns = Object.keys(rows[0]);
  const colList = columns.map((c) => `"${c}"`).join(", ");
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
  // OVERRIDING SYSTEM VALUE lets us insert explicit values into GENERATED
  // ALWAYS AS IDENTITY columns (security_events.id) — a no-op for tables
  // that don't have one, so it's safe to include on every insert here.
  for (const row of rows) {
    await supaSql.unsafe(
      `INSERT INTO "${table}" (${colList}) OVERRIDING SYSTEM VALUE VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
      columns.map((c) => row[c]),
    );
  }
  console.log(`✓ ${table}: ${rows.length} rows copied`);
  totalRows += rows.length;
}

console.log(`\nDone — ${totalRows} total rows copied across ${tableOrder.length} tables.`);
console.log(
  "Next: verify counts look right (Supabase Table Editor, or re-run this " +
    "script's SELECT COUNT(*) queries by hand), then update lib/db.ts and " +
    "DATABASE_URL to point at Supabase's Transaction pooler.",
);

await neonSql.end();
await supaSql.end();
