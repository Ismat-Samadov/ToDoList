// src/app/api/tasks/route.ts
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity } from '@/lib/logging';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    console.error('Unauthorized: User not logged in');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { message: 'Project ID is required' },
        { status: 400 }
      );
    }

    // First verify project access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
        isDeleted: false
      }
    });

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Then fetch tasks for this specific project
    const tasks = await prisma.task.findMany({
      where: { 
        projectId: projectId,
        userId: session.user.id,
        isDeleted: false
      },
      orderBy: { 
        position: 'asc',
        createdAt: 'desc' 
      },
    });

    // Calculate task statistics for logging
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length
    };

    await logUserActivity({
      userId: session.user.id,
      action: 'TASK_FETCH',
      metadata: {
        projectId,
        taskStats,
        timestamp: new Date().toISOString()
      }
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { projectId, title, description, priority, dueDate } = body;

    if (!projectId || !title) {
      return NextResponse.json(
        { message: 'Project ID and title are required' },
        { status: 400 }
      );
    }

    // Verify project access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
        isDeleted: false
      }
    });

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Get the last task position for ordering
    const lastTask = await prisma.task.findFirst({
      where: { 
        projectId,
        isDeleted: false 
      },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    // Create the task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: session.user.id,
        projectId,
        position: (lastTask?.position ?? 0) + 1000
      },
    });

    await logUserActivity({
      userId: session.user.id,
      action: 'TASK_CREATE',
      metadata: {
        taskId: task.id,
        projectId,
        title: task.title,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json(
      { message: 'Error creating task' },
      { status: 500 }
    );
  }
}