import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "@/generated/prisma/client";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
);

function resolveSqliteDatabaseUrl(raw: string): string {
  if (!raw.startsWith("file:")) {
    return raw;
  }
  const withoutScheme = raw.slice("file:".length);
  if (
    withoutScheme.startsWith("/") ||
    /^[A-Za-z]:[\\/]/.test(withoutScheme)
  ) {
    return raw;
  }
  const absolute = path.resolve(projectRoot, withoutScheme);
  return `file:${absolute}`;
}

/** Bumps when Prisma client setup changes; avoids reusing a bad client after dev HMR. */
const PRISMA_CLIENT_KIND = "driver-adapter:better-sqlite3:v2";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  __prismaClientKind?: string;
};

if (
  process.env.NODE_ENV !== "production" &&
  globalForPrisma.__prismaClientKind !== PRISMA_CLIENT_KIND
) {
  if (globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect().catch(() => {});
  }
  globalForPrisma.prisma = undefined;
  globalForPrisma.__prismaClientKind = PRISMA_CLIENT_KIND;
}

const databaseUrl = resolveSqliteDatabaseUrl(
  process.env.DATABASE_URL ?? "file:./dev.db"
);

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
