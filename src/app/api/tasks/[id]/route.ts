// src/app/api/tasks/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity } from '@/lib/logging'; // Import logging function

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const task = await prisma.task.update({
      where: { id: params.id },
      data: body,
    });

    // Log the task update activity
    await logUserActivity({
      userId: session.user.id,
      action: 'TASK_UPDATE',
      metadata: {
        taskId: params.id,
        updates: body,
      },
      ipAddress: '127.0.0.1', // Placeholder, replace with actual logic
      userAgent: 'User-Agent Unavailable', // Replace with req.headers['user-agent'] if available
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { message: 'Error updating task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const task = await prisma.task.delete({
      where: { id: params.id },
    });

    // Log the task deletion activity
    await logUserActivity({
      userId: session.user.id,
      action: 'TASK_DELETE',
      metadata: {
        taskId: params.id,
        taskTitle: task.title, // Assuming `title` exists on the task model
      },
      ipAddress: '127.0.0.1', // Placeholder, replace with actual logic
      userAgent: 'User-Agent Unavailable', // Replace with req.headers['user-agent'] if available
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { message: 'Error deleting task' },
      { status: 500 }
    );
  }
}
