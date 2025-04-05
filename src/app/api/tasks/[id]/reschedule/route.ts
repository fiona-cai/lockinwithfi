import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';

const rescheduleSchema = z.object({
  blockId: z.string(),
  newStartTime: z.string().transform((str) => new Date(str)),
  newEndTime: z.string().transform((str) => new Date(str)),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log('Received reschedule request body:', body);

    const validatedData = rescheduleSchema.parse(body);
    console.log('Validated reschedule data:', validatedData);

    // Get or create the dummy user
    const dummyEmail = "dummy@example.com";
    const user = await prisma.user.upsert({
      where: { email: dummyEmail },
      update: {},
      create: {
        email: dummyEmail,
        name: "Dummy User",
      },
    });

    // Update the scheduled block
    const updatedBlock = await prisma.scheduledBlock.update({
      where: {
        id: validatedData.blockId,
        task: {
          id: params.id,
          userId: user.id,
        },
      },
      data: {
        startTime: validatedData.newStartTime,
        endTime: validatedData.newEndTime,
      },
      include: {
        task: {
          include: {
            tags: true,
            scheduledBlocks: true,
          },
        },
      },
    });

    console.log('Updated block:', updatedBlock);
    return NextResponse.json(updatedBlock.task);
  } catch (error) {
    console.error('Error in PUT /api/tasks/[id]/reschedule:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error instanceof Error && error.message.includes('RecordNotFound')) {
      return NextResponse.json(
        { error: 'Task or block not found' },
        { status: 404 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { 
        error: 'Failed to reschedule task',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 