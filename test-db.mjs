import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.zxmuabybviquerpvvhxe:0WAQYr5VzS2vqV36@aws-0-ca-central-1.pooler.supabase.com:6543/postgres"
    }
  }
});

console.log('Testing database connection...');
try {
  const users = await prisma.user.findMany();
  console.log('Connection successful', users);
} catch (e) {
  console.error('Connection error:', e);
} finally {
  await prisma.$disconnect();
} 