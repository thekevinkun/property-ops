// Prisma client singleton — prevents multiple instances during hot reload in development.
// In production, a single instance is created and reused across all requests.
import { PrismaClient } from "@prisma/client/edge";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });

// Attach to globalThis in development to survive hot module reloads
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
