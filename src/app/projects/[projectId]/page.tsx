// src/app/projects/[projectId]/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';
import Navigation from '@/components/Navigation';
import ProjectDetailsContent from './ProjectDetailsContent';

export const dynamic = 'force-dynamic';

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
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return project;
}

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const project = await getProjectDetails(params.projectId, session.user.id);

  if (!project) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#1a1f25]">
      <Navigation />
      <ProjectDetailsContent initialProject={project} />
    </div>
  );
}
