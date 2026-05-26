// Prisma client singleton — prevents multiple instances during hot reload in development.
// In production, a single instance is created and reused across all requests.
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Create a global variable to hold the Prisma client instance
// This allows us to reuse the same instance across hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Create a new Prisma client instance with the PostgreSQL adapter and the connection string from the environment variable.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// If the Prisma client is already instantiated, use it. Otherwise, create a new instance.
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter, log: ["error"] });

// In development, attach the Prisma client to the global object to prevent multiple instances during hot reloads.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
