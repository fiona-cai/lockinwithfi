import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

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
    const taskId = params.id;
    const body = await request.json();
    console.log('Received update request:', { taskId, body });

    // Validate the request body
    const validatedData = taskSchema.parse(body);
    console.log('Validated data:', validatedData);

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

    // Update or create tags
    const tagPromises = validatedData.tags.map(tagName =>
      prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      })
    );
    const tags = await Promise.all(tagPromises);
    console.log('Updated/created tags:', tags);

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
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

    // If auto-scheduled is enabled, update scheduled blocks
    if (validatedData.isAutoScheduled) {
      // Delete existing scheduled blocks
      await prisma.scheduledBlock.deleteMany({
        where: { taskId: taskId },
      });

      // Create new scheduled block
      const scheduledBlock = await prisma.scheduledBlock.create({
        data: {
          startTime: validatedData.startDate,
          endTime: new Date(validatedData.startDate.getTime() + validatedData.duration * 60000),
          taskId: taskId,
        },
      });
      console.log('Created new scheduled block:', scheduledBlock);
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to update task',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 