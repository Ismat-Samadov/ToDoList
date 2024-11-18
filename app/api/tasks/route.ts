// app/api/tasks/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const task = await prisma.task.create({
      data: {
        title: json.title,
        description: json.description,
      },
    })
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating task' }, { status: 500 })
  }
}

// app/api/tasks/[id]/route.ts
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json()
    const task = await prisma.task.update({
      where: { id: params.id },
      data: { completed: json.completed },
    })
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: 'Error updating task' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.task.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: 'Task deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting task' }, { status: 500 })
  }
}