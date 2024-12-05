// src/app/projects/[projectId]/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';
import Navigation from '@/components/Navigation';
import ProjectDetailsView from './ProjectDetailsView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Project Details | MyFrog',
  description: 'View and manage project tasks',
};

async function getProjectDetails(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
      isDeleted: false,
    },
    include: {
      tasks: {
        where: { isDeleted: false },
        orderBy: [
          { status: 'asc' },
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
      },
      _count: {
        select: {
          tasks: {
            where: { isDeleted: false }
          }
        }
      }
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  return project;
}

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      redirect('/auth/signin');
    }

    const project = await getProjectDetails(params.projectId, session.user.id);

    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'PROJECT_VIEW',
        metadata: {
          projectId: project.id,
          projectName: project.name,
          timestamp: new Date().toISOString()
        }
      }
    });

    return (
      <div className="min-h-screen bg-[#1a1f25]">
        <Navigation />
        <ProjectDetailsView 
          project={project}
          user={session.user}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading project:', error);
    redirect('/dashboard');
  }
}