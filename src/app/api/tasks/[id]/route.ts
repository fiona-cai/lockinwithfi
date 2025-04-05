import { NextResponse } from 'next/server';

// In-memory storage for tasks (replace with database in production)
let tasks: any[] = [];

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskData = await request.json();
    const taskId = params.id;

    // Find and update the task
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Update the task
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...taskData,
    };

    return NextResponse.json(tasks[taskIndex]);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    // Find and remove the task
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    tasks.splice(taskIndex, 1);

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
} 