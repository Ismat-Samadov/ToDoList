// src/app/api/projects/route.ts
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity } from '@/lib/logging';
import { headers } from 'next/headers';
import { Project } from '@prisma/client';

// GET all projects
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('Unauthorized access attempt to GET /api/projects');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { 
        userId: session.user.id,
        isDeleted: false
      },
      include: {
        _count: {
          select: { 
            tasks: { 
              where: { isDeleted: false } 
            } 
          }
        }
      },
      orderBy: { 
        createdAt: 'desc' 
      },
    });

    const headersList = headers();
    await logUserActivity({
      userId: session.user.id,
      action: 'PROJECTS_VIEW',
      metadata: {
        timestamp: new Date().toISOString(),
        projectCount: projects.length
      },
      ipAddress: headersList.get('x-forwarded-for') || 'Unknown IP',
      userAgent: headersList.get('user-agent') || 'Unknown User-Agent'
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { message: 'Failed to fetch projects', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// CREATE new project
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('Unauthorized access attempt to POST /api/projects');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    // Validate input
    if (!name?.trim()) {
      return NextResponse.json(
        { message: 'Project name is required' },
        { status: 400 }
      );
    }

    // Create project with proper type inclusion
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });

    const headersList = headers();
    await logUserActivity({
      userId: session.user.id,
      action: 'PROJECT_CREATE',
      metadata: {
        projectId: project.id,
        name: project.name,
        timestamp: new Date().toISOString()
      },
      ipAddress: headersList.get('x-forwarded-for') || 'Unknown IP',
      userAgent: headersList.get('user-agent') || 'Unknown User-Agent'
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { message: 'Failed to create project', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// UPDATE project
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('Unauthorized access attempt to PATCH /api/projects');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { id, name, description } = body;

    if (!id || !name?.trim()) {
      return NextResponse.json(
        { message: 'Project ID and name are required' },
        { status: 400 }
      );
    }

    // Verify project ownership
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id,
        isDeleted: false
      }
    });

    if (!existingProject) {
      return NextResponse.json(
        { message: 'Project not found or access denied' },
        { status: 404 }
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
        description: description?.trim() || null,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });

    const headersList = headers();
    await logUserActivity({
      userId: session.user.id,
      action: 'PROJECT_UPDATE',
      metadata: {
        projectId: project.id,
        name: project.name,
        timestamp: new Date().toISOString()
      },
      ipAddress: headersList.get('x-forwarded-for') || 'Unknown IP',
      userAgent: headersList.get('user-agent') || 'Unknown User-Agent'
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { message: 'Failed to update project', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE project
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('Unauthorized access attempt to DELETE /api/projects');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify project ownership
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId: session.user.id,
        isDeleted: false
      }
    });

    if (!existingProject) {
      return NextResponse.json(
        { message: 'Project not found or access denied' },
        { status: 404 }
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

    const headersList = headers();
    await logUserActivity({
      userId: session.user.id,
      action: 'PROJECT_DELETE',
      metadata: {
        projectId: id,
        projectName: existingProject.name,
        timestamp: new Date().toISOString()
      },
      ipAddress: headersList.get('x-forwarded-for') || 'Unknown IP',
      userAgent: headersList.get('user-agent') || 'Unknown User-Agent'
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { message: 'Failed to delete project', error: (error as Error).message },
      { status: 500 }
    );
  }
}