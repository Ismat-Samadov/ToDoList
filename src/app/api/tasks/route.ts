// src/app/api/tasks/route.ts
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity } from '@/lib/logging';

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

    await logUserActivity({
      userId: session.user.id,
      action: 'TASK_CREATE',
      metadata: {
        taskId: task.id,
        title: task.title,
        dueDate: task.dueDate,
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

    await logUserActivity({
      userId: session.user.id,
      action: 'TASK_FETCH',
      metadata: {
        totalTasksFetched: tasks.length,
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