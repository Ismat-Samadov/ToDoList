// src/app/dashboard/DashboardContent.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Project, Task } from '@prisma/client';
import Navigation from '@/components/Navigation';
import ProjectList from '@/components/projects/ProjectList';
import { toast } from 'react-hot-toast';
import { logClientActivity } from '@/lib/logging';

interface DashboardContentProps {
  initialData?: {
    projects: Array<Project & {
      _count: { tasks: number };
      tasks: Task[];
    }>;
    recentTasks: Task[];
    taskStats: {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
    };
  };
  user?: {
    id: string;
    email?: string | null;
    name?: string | null;
  };
}

interface ProjectWithCount extends Project {
  _count: { tasks: number };
}

export default function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      toast.error('You must be logged in to access the dashboard.');
      router.replace('/auth/signin');
      return;
    }

    logDashboardAccess();
    fetchProjects();
    setIsInitialLoading(false);
  }, [session, status, router]);

  const logDashboardAccess = async () => {
    if (!session?.user?.id) return;
    try {
      await logClientActivity({
        userId: session.user.id,
        action: 'DASHBOARD_ACCESS',
        metadata: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Failed to log dashboard access:', error);
    }
  };

  const fetchProjects = async () => {
    if (!session?.user?.id) return;
    setIsLoadingProjects(true);
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data: ProjectWithCount[] = await response.json();
      setProjects(data);

      await logClientActivity({
        userId: session.user.id,
        action: 'PROJECTS_VIEW',
        metadata: {
          projectCount: data.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
      await logClientActivity({
        userId: session.user.id,
        action: 'DASHBOARD_ERROR',
        metadata: {
          error: 'Failed to fetch projects',
          timestamp: new Date().toISOString()
        }
      });
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleProjectSelect = (project: ProjectWithCount) => {
    router.push(`/projects/${project.id}`);
  };

  if (isInitialLoading || status === 'loading' || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1f25]">
        <div className="text-center text-white">
          <p className="text-lg">Loading...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we set up your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1f25]">
      <Navigation />
      
      <main className="px-4">
        <div className="pt-20 pb-4">
          <h1 className="text-white text-2xl font-semibold mb-2">
            Welcome, {session.user.name || 'User'}
          </h1>
          <p className="text-[#94a3b8] text-xl">
            Manage your projects and tasks
          </p>
        </div>

        <div className="mb-8">
          {isLoadingProjects ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading projects...</p>
            </div>
          ) : (
            <ProjectList
              projects={projects}
              onProjectSelect={handleProjectSelect}
              onProjectUpdated={fetchProjects}
            />
          )}
        </div>

        {projects.length === 0 && !isLoadingProjects && (
          <div className="text-center py-8">
            <p className="text-gray-400">
              You don't have any projects yet. Create your first project to get started!
            </p>
          </div>
        )}
      </main>

      <div className="h-28" />
    </div>
  );
}