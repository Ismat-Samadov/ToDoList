// src/app/api/tasks/route.ts
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity, logTaskEvent } from '@/lib/logging';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    console.error('Unauthorized: User not logged in');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const task = await prisma.task.create({
      data: {
        ...body,
        userId: session.user.id,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        isDeleted: false
      },
    });

    // Log task creation event
    await logTaskEvent({
      taskId: task.id,
      type: 'TASK_CREATED',
      newValue: JSON.stringify({
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate
      })
    });

    await logUserActivity({
      userId: session.user.id,
      action: 'TASK_CREATE',
      metadata: {
        taskId: task.id,
        title: task.title,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority
      },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'User-Agent Unavailable',
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

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    console.error('Unauthorized: User not logged in');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: { 
        userId: session.user.id,
        isDeleted: false
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate task statistics
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      highPriority: tasks.filter(t => t.priority === 'HIGH').length
    };

    await logUserActivity({
      userId: session.user.id,
      action: 'TASK_FETCH',
      metadata: {
        taskStats,
        timestamp: new Date().toISOString()
      },
      ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'User-Agent Unavailable',
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