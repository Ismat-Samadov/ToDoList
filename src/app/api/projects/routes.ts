// src/app/api/projects/route.ts
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity } from '@/lib/logging';

// GET all projects
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: { 
        userId: session.user.id,
        isDeleted: false
      },
      include: {
        _count: {
          select: { tasks: { where: { isDeleted: false } } }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    await logUserActivity({
      userId: session.user.id,
      action: 'PROJECTS_VIEW',
      metadata: {
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { message: 'Error fetching projects' },
      { status: 500 }
    );
  }
}

// CREATE new project
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { message: 'Project name is required' },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description,
        userId: session.user.id,
      },
    });

    await logUserActivity({
      userId: session.user.id,
      action: 'PROJECT_CREATE',
      metadata: {
        projectId: project.id,
        name: project.name,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { message: 'Error creating project' },
      { status: 500 }
    );
  }
}

// PATCH update project
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, description } = body;

    if (!id || !name?.trim()) {
      return NextResponse.json(
        { message: 'Project ID and name are required' },
        { status: 400 }
      );
    }

    const project = await prisma.project.update({
      where: {
        id,
        userId: session.user.id,
        isDeleted: false,
      },
      data: {
        name: name.trim(),
        description,
        updatedAt: new Date(),
      },
    });

    await logUserActivity({
      userId: session.user.id,
      action: 'PROJECT_UPDATE',
      metadata: {
        projectId: project.id,
        name: project.name,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { message: 'Error updating project' },
      { status: 500 }
    );
  }
}

// DELETE project (soft delete)
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Soft delete the project and its tasks
    await prisma.$transaction([
      prisma.project.update({
        where: {
          id,
          userId: session.user.id,
          isDeleted: false,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      }),
      prisma.task.updateMany({
        where: {
          projectId: id,
          isDeleted: false,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      }),
    ]);

    await logUserActivity({
      userId: session.user.id,
      action: 'PROJECT_DELETE',
      metadata: {
        projectId: id,
        timestamp: new Date().toISOString()
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { message: 'Error deleting project' },
      { status: 500 }
    );
  }
}