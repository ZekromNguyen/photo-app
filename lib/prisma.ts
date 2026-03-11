import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPrisma = globalThis as any;

function createPrismaClient() {
  // Import Pool from adapter's bundled pg to avoid type conflicts
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
