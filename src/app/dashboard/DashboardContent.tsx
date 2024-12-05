// src/app/dashboard/DashboardContent.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Project, Task } from '@prisma/client';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithCount | null>(null);
  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      toast.error('You must be logged in to access the dashboard.');
      router.replace('/auth/signin');
      return;
    }

    const logDashboardAccess = async () => {
      try {
        await logClientActivity({
          userId: session.user.id,
          action: 'DASHBOARD_ACCESS',
          metadata: {
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Failed to log dashboard access:', error);
      }
    };

    logDashboardAccess();
    fetchProjects();
    setIsInitialLoading(false);
  }, [session, status, router]);

  const fetchProjects = async () => {
    if (!session?.user?.id) return;
    
    setIsLoadingProjects(true);
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data: ProjectWithCount[] = await response.json();
      setProjects(data);
      
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
        await logClientActivity({
          userId: session.user.id,
          action: 'PROJECTS_VIEW',
          metadata: {
            projectCount: data.length,
            timestamp: new Date().toISOString()
          }
        });
      }
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

  const handleTaskAdded = async () => {
    try {
      if (session?.user?.id && selectedProject) {
        await logClientActivity({
          userId: session.user.id,
          action: 'PROJECT_TASK_CREATE',
          metadata: {
            projectId: selectedProject.id,
            projectName: selectedProject.name,
            timestamp: new Date().toISOString()
          }
        });
      }
      setRefreshTrigger(prev => prev + 1);
      setShowMobileForm(false);
      toast.success('Task added successfully!');
    } catch (error) {
      console.error('Error logging task creation:', error);
      toast.error('Task added but logging failed');
    }
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
              selectedProject={selectedProject}
              onProjectSelect={setSelectedProject}
              onProjectUpdated={fetchProjects}
            />
          )}
        </div>

        {selectedProject && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Tasks for {selectedProject.name}
            </h2>
            <TaskList 
              projectId={selectedProject.id} 
              refreshTrigger={refreshTrigger} 
            />
          </div>
        )}

        {selectedProject && (
          <button
            onClick={() => setShowMobileForm(true)}
            className="fixed right-4 bottom-20 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg z-50 hover:bg-blue-700 transition-colors"
            aria-label="Add new task"
          >
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v12m6-6H6"
              />
            </svg>
          </button>
        )}

        {showMobileForm && selectedProject && (
          <div className="fixed inset-0 bg-[#1a1f25] z-50">
            <div className="flex flex-col h-full">
              <div className="px-4 py-3 flex items-center justify-between border-b border-[#2f3641]">
                <h2 className="text-xl font-semibold text-white">
                  Add Task to {selectedProject.name}
                </h2>
                <button
                  onClick={() => setShowMobileForm(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <TaskForm 
                  projectId={selectedProject.id}
                  onTaskAdded={handleTaskAdded}
                />
              </div>
            </div>
          </div>
        )}

        {!selectedProject && projects.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">
              Please select a project to view and manage tasks
            </p>
          </div>
        )}

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