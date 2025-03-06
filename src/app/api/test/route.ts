import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Successfully connected to database');

    // Test a simple query
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);

    return NextResponse.json({ 
      status: 'ok',
      message: 'Database connection successful',
      userCount 
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({ 
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  } finally {
    await prisma.$disconnect();
  }
} 