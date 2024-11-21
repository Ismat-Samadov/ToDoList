// src/app/api/tasks/route.ts	
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity } from '@/lib/logging'; // Import logging function

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const task = await prisma.task.create({
      data: {
        ...body,
        userId: (session.user as any).id,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });

    // Log task creation activity
    await logUserActivity({
      userId: session.user.id,
      action: 'TASK_CREATE',
      metadata: {
        taskId: task.id,
        title: task.title,
        dueDate: task.dueDate,
      },
      ipAddress: '127.0.0.1', // Placeholder, replace with actual logic
      userAgent: 'User-Agent Unavailable', // Replace with req.headers['user-agent'] if available
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json(
      { message: 'Error creating task' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { createdAt: 'desc' },
    });

    // Log task fetch activity
    await logUserActivity({
      userId: session.user.id,
      action: 'TASK_FETCH',
      metadata: {
        totalTasksFetched: tasks.length,
      },
      ipAddress: '127.0.0.1', // Placeholder, replace with actual logic
      userAgent: 'User-Agent Unavailable', // Replace with req.headers['user-agent'] if available
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Task fetch error:', error);
    return NextResponse.json(
      { message: 'Error fetching tasks' },
      { status: 500 }
    );
  }
}
