// src/app/projects/[projectId]/ProjectDetailsContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { Task, Project } from '@prisma/client';
import { useSession } from 'next-auth/react';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';
import { toast } from 'react-hot-toast';
import { logClientActivity } from '@/lib/logging';

interface ProjectWithTasks extends Project {
  tasks: Task[];
}

interface ProjectDetailsContentProps {
  initialProject: ProjectWithTasks;
}

export default function ProjectDetailsContent({ 
  initialProject 
}: ProjectDetailsContentProps) {
  const { data: session } = useSession();
  const [project, setProject] = useState(initialProject);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      logClientActivity({
        userId: session.user.id,
        action: 'PROJECT_VIEW',
        metadata: {
          projectId: project.id,
          projectName: project.name,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [project.id, project.name, session?.user?.id]);

  const handleTaskAdded = async () => {
    setIsLoading(true);
    try {
      if (session?.user?.id) {
        await logClientActivity({
          userId: session.user.id,
          action: 'PROJECT_TASK_CREATE',
          metadata: {
            projectId: project.id,
            projectName: project.name,
            timestamp: new Date().toISOString()
          }
        });
      }
      setShowTaskForm(false);
      setRefreshTrigger(prev => prev + 1);
      toast.success('Task added successfully!');
    } catch (error) {
      console.error('Error handling task creation:', error);
      toast.error('Error logging task creation');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProject = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}`);
      if (!response.ok) throw new Error('Failed to refresh project');
      const updatedProject = await response.json();
      setProject(updatedProject);
    } catch (error) {
      console.error('Error refreshing project:', error);
      toast.error('Failed to refresh project data');
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 pt-20">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-gray-400">{project.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshProject}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Refresh project"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              onClick={() => setShowTaskForm(true)}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Add Task
            </button>
          </div>
        </div>
      </div>

      <TaskList 
        projectId={project.id}
        refreshTrigger={refreshTrigger} 
      />

      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#2f3641] rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Add New Task</h2>
              <button
                onClick={() => setShowTaskForm(false)}
                className="text-gray-400 hover:text-white"
                disabled={isLoading}
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
            <TaskForm
              projectId={project.id}
              onTaskAdded={handleTaskAdded}
              isDisabled={isLoading}
            />
          </div>
        </div>
      )}
    </main>
  );
}