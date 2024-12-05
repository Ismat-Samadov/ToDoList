// src/components/projects/ProjectList.tsx
'use client';

import { useState, Dispatch, SetStateAction } from 'react';
import { Project } from '@prisma/client';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';
import { logClientActivity } from '@/lib/logging';

interface ProjectWithCount extends Project {
  _count: {
    tasks: number;
  };
}

interface ProjectListProps {
  projects: ProjectWithCount[];
  selectedProject: ProjectWithCount | null;
  onProjectSelect: Dispatch<SetStateAction<ProjectWithCount | null>>;
  onProjectUpdated: () => Promise<void>;
}

export default function ProjectList({
  projects,
  selectedProject,
  onProjectSelect,
  onProjectUpdated
}: ProjectListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const handleCreateProject = async (projectData: { name: string; description?: string }) => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) throw new Error('Failed to create project');
      const project = await response.json();

      await logClientActivity({
        userId: session.user.id,
        action: 'PROJECT_CREATE',
        metadata: {
          projectId: project.id,
          name: project.name,
          timestamp: new Date().toISOString()
        }
      });

      await onProjectUpdated();
      setShowCreateModal(false);
      toast.success('Project created successfully');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      await logClientActivity({
        userId: session.user.id,
        action: 'PROJECT_CREATE',
        metadata: {
          error: 'Failed to create project',
          timestamp: new Date().toISOString()
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProject = async (projectId: string, data: { name: string; description?: string }) => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, ...data }),
      });

      if (!response.ok) throw new Error('Failed to update project');
      const project = await response.json();

      await logClientActivity({
        userId: session.user.id,
        action: 'PROJECT_UPDATE',
        metadata: {
          projectId: project.id,
          name: project.name,
          timestamp: new Date().toISOString()
        }
      });

      await onProjectUpdated();
      toast.success('Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
      await logClientActivity({
        userId: session.user.id,
        action: 'PROJECT_UPDATE',
        metadata: {
          projectId,
          error: 'Failed to update project',
          timestamp: new Date().toISOString()
        }
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete project');

      await logClientActivity({
        userId: session.user.id,
        action: 'PROJECT_DELETE',
        metadata: {
          projectId,
          timestamp: new Date().toISOString()
        }
      });

      await onProjectUpdated();
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
      await logClientActivity({
        userId: session.user.id,
        action: 'PROJECT_DELETE',
        metadata: {
          projectId,
          error: 'Failed to delete project',
          timestamp: new Date().toISOString()
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Projects</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={isLoading}
          className={`bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        >
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No projects yet. Create your first project to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isSelected={selectedProject?.id === project.id}
              onSelect={() => onProjectSelect(project)}
              onDelete={handleDeleteProject}
              onUpdate={handleUpdateProject}
              disabled={isLoading}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
          isDisabled={isLoading}
        />
      )}
    </div>
  );
}