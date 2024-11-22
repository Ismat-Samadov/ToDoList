// src/app/api/tasks/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity, logTaskEvent } from '@/lib/logging';

function getClientInfo(request: Request) {
  return {
    ipAddress: request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1',
    userAgent: request.headers.get('user-agent') || 'User-Agent Unavailable'
  };
}

async function verifyTaskAccess(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
      isDeleted: false
    },
    select: { id: true }
  });
  return !!task;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const hasAccess = await verifyTaskAccess(params.id, session.user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { message: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Get original task data for comparison
    const originalTask = await prisma.task.findUnique({
      where: { id: params.id }
    });

    // Update task
    const task = await prisma.task.update({
      where: { 
        id: params.id,
        userId: session.user.id,
        isDeleted: false
      },
      data: {
        ...body,
        updatedAt: new Date()
      },
    });

    // Log status change
    if (body.status && body.status !== originalTask?.status) {
      await logTaskEvent({
        taskId: params.id,
        type: 'STATUS_CHANGED',
        oldValue: originalTask?.status,
        newValue: body.status
      });
    }

    // Log priority change
    if (body.priority && body.priority !== originalTask?.priority) {
      await logTaskEvent({
        taskId: params.id,
        type: 'PRIORITY_CHANGED',
        oldValue: originalTask?.priority,
        newValue: body.priority
      });
    }

    const { ipAddress, userAgent } = getClientInfo(request);

    await logUserActivity({
      userId: session.user.id,
      action: 'TASK_UPDATE',
      metadata: {
        taskId: params.id,
        updates: body,
        timestamp: new Date().toISOString()
      },
      ipAddress,
      userAgent,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      );
    }

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
    const hasAccess = await verifyTaskAccess(params.id, session.user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { message: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    const task = await prisma.task.update({
      where: { 
        id: params.id,
        userId: session.user.id,
        isDeleted: false
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
      select: {
        id: true,
        title: true
      }
    });

    await logTaskEvent({
      taskId: params.id,
      type: 'TASK_DELETED',
      oldValue: 'active',
      newValue: 'deleted'
    });

    const { ipAddress, userAgent } = getClientInfo(request);

    await logUserActivity({
      userId: session.user.id,
      action: 'TASK_DELETE',
      metadata: {
        taskId: params.id,
        taskTitle: task.title,
        timestamp: new Date().toISOString()
      },
      ipAddress,
      userAgent,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting task:', error);
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Error deleting task' },
      { status: 500 }
    );
  }
}