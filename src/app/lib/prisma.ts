import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres.zxmuabybviquerpvvhxe:0WAQYr5VzS2vqV36@aws-0-ca-central-1.pooler.supabase.com:6543/postgres"
      }
    },
    log: ['query', 'error', 'warn']
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} 