// src/app/api/projects/[projectId]/tasks/route.ts
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity } from '@/lib/logging';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional().nullable(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING'),
});

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        userId: session.user.id,
        isDeleted: false,
      },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId: params.projectId,
        isDeleted: false,
      },
      orderBy: { position: 'asc' },
    });

    await logUserActivity({
      userId: session.user.id,
      action: 'PROJECT_TASKS_VIEW',
      metadata: { projectId: params.projectId }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

    const body = await request.json();
    const validatedData = taskSchema.parse(body);

    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        userId: session.user.id,
        isDeleted: false,
      },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const lastTask = await prisma.task.findFirst({
      where: { projectId: params.projectId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        position: (lastTask?.position ?? 0) + 1000,
        userId: session.user.id,
        projectId: params.projectId,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      },
    });

    await logUserActivity({
      userId: session.user.id,
      action: 'TASK_CREATE',
      metadata: {
        projectId: params.projectId,
        taskId: task.id,
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid task data', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}