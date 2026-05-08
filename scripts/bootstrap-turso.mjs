import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@libsql/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const client = createClient({
  url: databaseUrl,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

const migrationsDir = path.join(process.cwd(), "prisma", "migrations");

function splitSqlStatements(sql) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

const migrationEntries = (await readdir(migrationsDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const migrationName of migrationEntries) {
  const migrationPath = path.join(migrationsDir, migrationName, "migration.sql");
  const migrationSql = await readFile(migrationPath, "utf8");
  const statements = splitSqlStatements(migrationSql);

  for (const statement of statements) {
    try {
      await client.execute(statement);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      if (!message.includes("already exists")) {
        throw error;
      }
    }
  }
}

await client.close();

console.log(`Applied ${migrationEntries.length} migration(s) to Turso.`);
