import { getServerSession } from "next-auth/next";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

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
        dueDate: body.dueDate ? new Date(body.dueDate) : null
      },
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

  const tasks = await prisma.task.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(tasks);
}