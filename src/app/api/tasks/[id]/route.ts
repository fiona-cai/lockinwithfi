import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/app/lib/prisma';

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  startDate: z.string().transform((str) => new Date(str)),
  deadline: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  duration: z.number().min(1, "Duration is required"),
  maxTimePerSitting: z.number().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()),
  isAutoScheduled: z.boolean(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log('Received update request body:', body);

    const validatedData = taskSchema.parse(body);
    console.log('Validated update data:', validatedData);

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

    // Create or get tags
    const tagPromises = validatedData.tags.map(tagName =>
      prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      })
    );
    const tags = await Promise.all(tagPromises);
    console.log('Created/updated tags:', tags);

    // Update the task
    const updatedTask = await prisma.task.update({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startDate: validatedData.startDate,
        deadline: validatedData.deadline,
        duration: validatedData.duration,
        maxTimePerSitting: validatedData.maxTimePerSitting,
        isAutoScheduled: validatedData.isAutoScheduled,
        tags: {
          set: tags.map(tag => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
        scheduledBlocks: true,
      },
    });
    console.log('Updated task:', updatedTask);

    // If auto-scheduled is enabled, update or create the scheduled block
    if (validatedData.isAutoScheduled) {
      const existingBlock = await prisma.scheduledBlock.findFirst({
        where: { taskId: updatedTask.id },
      });

      if (existingBlock) {
        await prisma.scheduledBlock.update({
          where: { id: existingBlock.id },
          data: {
            startTime: validatedData.startDate,
            endTime: new Date(validatedData.startDate.getTime() + validatedData.duration * 60000),
          },
        });
      } else {
        await prisma.scheduledBlock.create({
          data: {
            startTime: validatedData.startDate,
            endTime: new Date(validatedData.startDate.getTime() + validatedData.duration * 60000),
            taskId: updatedTask.id,
          },
        });
      }
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error in PUT /api/tasks/[id]:', error);
    
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
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { 
        error: 'Failed to update task',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 