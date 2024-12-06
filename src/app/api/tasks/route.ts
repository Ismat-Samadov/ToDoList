// src/app/api/tasks/route.ts
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity, logTaskEvent } from '@/lib/logging';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING'),
  dueDate: z.string().optional().nullable(),
  projectId: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const validatedData = taskSchema.parse(body);

    // Verify project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: validatedData.projectId,
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

    // Get last position for ordering
    const lastTask = await prisma.task.findFirst({
      where: {
        projectId: validatedData.projectId,
        isDeleted: false
      },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    // Create task with validated data
    const task = await prisma.task.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        position: (lastTask?.position ?? 0) + 1000,
        isDeleted: false
      },
    });

    // Log task creation
    await Promise.all([
      logTaskEvent({
        taskId: task.id,
        type: 'TASK_CREATED',
        projectId: validatedData.projectId,
        newValue: JSON.stringify({
          title: task.title,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate
        })
      }),
      logUserActivity({
        userId: session.user.id,
        action: 'TASK_CREATE',
        metadata: {
          taskId: task.id,
          projectId: validatedData.projectId,
          title: task.title,
          status: task.status,
          priority: task.priority,
          timestamp: new Date().toISOString()
        },
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'User-Agent Unavailable',
      })
    ]);

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Task creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid task data', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Error creating task' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { message: 'Project ID is required' },
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

    // Fetch tasks for the specific project
    const tasks = await prisma.task.findMany({
      where: {
        projectId,
        userId: session.user.id,
        isDeleted: false
      },
      orderBy: [
        { position: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    // Calculate project-specific stats
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
        projectId,
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