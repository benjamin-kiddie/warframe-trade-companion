import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });

const prismaGlobal = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = prismaGlobal.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  prismaGlobal.prisma = prisma;
}
