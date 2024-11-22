// src/app/api/tasks/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity } from '@/lib/logging';

// Helper function to get client info
function getClientInfo(request: Request) {
  return {
    ipAddress: request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1',
    userAgent: request.headers.get('user-agent') || 'User-Agent Unavailable'
  };
}

// Helper function to verify task ownership
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
    // Verify task access
    const hasAccess = await verifyTaskAccess(params.id, session.user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { message: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
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

    // Get client info
    const { ipAddress, userAgent } = getClientInfo(request);

    // Log activity asynchronously
    logUserActivity({
      userId: session.user.id,
      action: 'TASK_UPDATE',
      metadata: {
        taskId: params.id,
        updates: body,
        timestamp: new Date().toISOString()
      },
      ipAddress,
      userAgent,
    }).catch(error => {
      // Log but don't fail the request
      console.error('Error logging activity:', error);
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    
    // More specific error handling
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
    // Verify task access
    const hasAccess = await verifyTaskAccess(params.id, session.user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { message: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    // Perform soft delete
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

    // Get client info
    const { ipAddress, userAgent } = getClientInfo(request);

    // Log activity asynchronously
    logUserActivity({
      userId: session.user.id,
      action: 'TASK_DELETE',
      metadata: {
        taskId: params.id,
        taskTitle: task.title,
        timestamp: new Date().toISOString()
      },
      ipAddress,
      userAgent,
    }).catch(error => {
      // Log but don't fail the request
      console.error('Error logging activity:', error);
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting task:', error);
    
    // More specific error handling
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