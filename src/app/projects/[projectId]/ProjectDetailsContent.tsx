// src/app/projects/[projectId]/ProjectDetailsContent.tsx

'use client';

import { useState } from 'react';
import { Task, Project } from '@prisma/client';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';
import { toast } from 'react-hot-toast';

interface ProjectWithTasks extends Project {
  tasks: Task[];
}

interface ProjectDetailsContentProps {
  initialProject: ProjectWithTasks;
}

export default function ProjectDetailsContent({ 
  initialProject 
}: ProjectDetailsContentProps) {
  const [project, setProject] = useState(initialProject);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTaskAdded = () => {
    setShowTaskForm(false);
    setRefreshTrigger(prev => prev + 1);
    toast.success('Task added successfully!');
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
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Task
          </button>
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
            />
          </div>
        </div>
      )}
    </main>
  );
}