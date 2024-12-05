// src/app/api/projects/[projectId]/tasks/route.ts
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity } from '@/lib/logging';

// GET tasks for a specific project
export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Verify project access
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        userId: session.user.id,
        isDeleted: false,
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId: params.projectId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    await logUserActivity({
      userId: session.user.id,
      action: 'PROJECT_TASKS_VIEW',
      metadata: {
        projectId: params.projectId,
        taskCount: tasks.length,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    return NextResponse.json(
      { message: 'Error fetching tasks' },
      { status: 500 }
    );
  }
}

// CREATE new task in project
export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Verify project access
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        userId: session.user.id,
        isDeleted: false,
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const task = await prisma.task.create({
      data: {
        ...body,
        userId: session.user.id,
        projectId: params.projectId,
      },
    });

    await logUserActivity({
      userId: session.user.id,
      action: 'PROJECT_TASK_CREATE',
      metadata: {
        projectId: params.projectId,
        taskId: task.id,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { message: 'Error creating task' },
      { status: 500 }
    );
  }
}
