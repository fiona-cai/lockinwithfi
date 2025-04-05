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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    const validatedData = taskSchema.parse(body);
    console.log('Validated data:', validatedData);

    // Create or get the dummy user
    const dummyEmail = "dummy@example.com";
    const user = await prisma.user.upsert({
      where: { email: dummyEmail },
      update: {},
      create: {
        email: dummyEmail,
        name: "Dummy User",
      },
    });
    console.log('Using user:', user);

    // Create or get tags
    try {
      const tagPromises = validatedData.tags.map(tagName =>
        prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        })
      );
      const tags = await Promise.all(tagPromises);
      console.log('Created/updated tags:', tags);

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
          userId: user.id, // Use the actual user ID
          tags: {
            connect: tags.map(tag => ({ id: tag.id })),
          },
        },
        include: {
          tags: true,
        },
      });
      console.log('Created task:', task);

      // If auto-scheduled is enabled, create a scheduled block
      if (validatedData.isAutoScheduled) {
        const scheduledBlock = await prisma.scheduledBlock.create({
          data: {
            startTime: validatedData.startDate,
            endTime: new Date(validatedData.startDate.getTime() + validatedData.duration * 60000),
            taskId: task.id,
          },
        });
        console.log('Created scheduled block:', scheduledBlock);
      }

      // Return the created task with its relationships
      const fullTask = await prisma.task.findUnique({
        where: { id: task.id },
        include: {
          tags: true,
          scheduledBlocks: true,
        },
      });

      return NextResponse.json(fullTask);
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json(
        { 
          error: 'Database operation failed',
          message: dbError instanceof Error ? dbError.message : 'Unknown database error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/tasks:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { 
        error: 'Failed to create task',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
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

    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id,
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log('Received update request body:', body);

    const validatedData = taskSchema.parse(body);
    console.log('Validated update data:', validatedData);

    // Get the task ID from the URL
    const url = new URL(request.url);
    const taskId = url.pathname.split('/').pop();
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

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
        id: taskId,
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
    console.error('Error in PUT /api/tasks:', error);
    
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