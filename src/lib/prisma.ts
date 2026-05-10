import path from "node:path";
import { pathToFileURL } from "node:url";

import { PrismaLibSql } from "@prisma/adapter-libsql";

import { PrismaClient } from "@/generated/prisma/client";

/** Bumps when Prisma client setup changes; avoids reusing a bad client after dev HMR. */
const PRISMA_CLIENT_KIND = "driver-adapter:libsql:v2";

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

/**
 * LibSQL rejects relative `file:./…` URLs. Resolve to an absolute `file://…` URL.
 */
function extractFileUrl(raw: string): string {
  const t = raw.trim();
  const fileMatch = t.match(/file:\S+/);
  if (fileMatch) {
    return fileMatch[0];
  }
  return t;
}

function resolveDatabaseUrl(raw: string): string {
  const t = extractFileUrl(raw);
  if (!t.startsWith("file:")) {
    return t;
  }
  const tail = t.replace(/^file:/i, "");
  if (!tail) {
    return pathToFileURL(path.resolve(process.cwd(), "dev.db")).href;
  }
  const fsPath = path.isAbsolute(tail)
    ? path.normalize(tail)
    : path.resolve(process.cwd(), tail.replace(/^\.\//, ""));
  return pathToFileURL(fsPath).href;
}

const databaseUrl = resolveDatabaseUrl(
  process.env.DATABASE_URL?.trim() || "file:./dev.db"
);
const authToken =
  process.env.TURSO_AUTH_TOKEN?.trim() ||
  process.env.TURSO_AUTH_TOKEN2?.trim();

const adapter = new PrismaLibSql({
  url: databaseUrl,
  authToken,
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
