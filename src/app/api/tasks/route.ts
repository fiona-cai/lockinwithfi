import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = taskSchema.parse(body);

    // For now, we'll use a dummy user ID until we implement authentication
    const userId = "dummy-user-id";

    // Create or get tags
    const tagPromises = validatedData.tags.map(tagName =>
      prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      })
    );
    const tags = await Promise.all(tagPromises);

    // Create the task
    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startDate: validatedData.startDate,
        deadline: validatedData.deadline,
        duration: validatedData.duration,
        maxTimePerSitting: validatedData.maxTimePerSitting,
        isAutoScheduled: validatedData.isAutoScheduled,
        userId,
        tags: {
          connect: tags.map(tag => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
      },
    });

    // If auto-scheduled is enabled, calculate time blocks
    if (validatedData.isAutoScheduled) {
      // This is where we'll implement the AI scheduling logic
      // For now, we'll create a simple scheduled block
      await prisma.scheduledBlock.create({
        data: {
          startTime: validatedData.startDate,
          endTime: new Date(validatedData.startDate.getTime() + validatedData.duration * 60000),
          taskId: task.id,
        },
      });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // For now, we'll use a dummy user ID
    const userId = "dummy-user-id";

    const tasks = await prisma.task.findMany({
      where: {
        userId,
      },
      include: {
        tags: true,
        scheduledBlocks: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
} 