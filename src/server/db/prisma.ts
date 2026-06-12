import { PrismaClient } from "@prisma/client";

declare global {
  var __musicHubPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__musicHubPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__musicHubPrisma = prisma;
}
