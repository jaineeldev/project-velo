import { neon } from "@neondatabase/serverless";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const env = readFileSync(join(root, ".env.local"), "utf8");
for (const line of env.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// Ensure the ledger table exists before reading from it. Safe to run on every
// invocation — no-op once created.
await sql.query(`
  CREATE TABLE IF NOT EXISTS migrations (
    filename text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )
`);

const migrationsDir = join(root, "db", "migrations");
const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();

// Bootstrap: the first run after this tracking change has an empty ledger
// but the 11 existing migrations were already applied manually. Detect that
// case (users table exists, ledger empty) and backfill the ledger so we
// don't try to CREATE TABLE users a second time.
const appliedRows = await sql.query(`SELECT filename FROM migrations`);
if (appliedRows.length === 0) {
  const [{ schema_initialised: usersExists }] = await sql.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'users'
    ) AS schema_initialised
  `);
  if (usersExists) {
    console.log("· bootstrapping ledger with already-applied migrations");
    for (const file of files) {
      await sql.query(
        `INSERT INTO migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING`,
        [file],
      );
      appliedRows.push({ filename: file });
    }
  }
}
const applied = new Set(appliedRows.map((r) => r.filename));

let appliedCount = 0;
let skippedCount = 0;

for (const file of files) {
  if (applied.has(file)) {
    console.log(`· ${file} (already applied)`);
    skippedCount++;
    continue;
  }

  console.log(`→ applying ${file}`);
  const text = readFileSync(join(migrationsDir, file), "utf8");
  const statements = text
    .split(/;\s*\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await sql.query(stmt);
  }

  await sql.query(`INSERT INTO migrations (filename) VALUES ($1)`, [file]);
  console.log(`✓ ${file} (${statements.length} statements)`);
  appliedCount++;
}

console.log(`done — ${appliedCount} applied, ${skippedCount} skipped`);
