import { PrismaLibSql } from "@prisma/adapter-libsql";

import { PrismaClient } from "@/generated/prisma/client";

/** Bumps when Prisma client setup changes; avoids reusing a bad client after dev HMR. */
const PRISMA_CLIENT_KIND = "driver-adapter:libsql:v1";

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

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";

const adapter = new PrismaLibSql({
  url: databaseUrl,
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
