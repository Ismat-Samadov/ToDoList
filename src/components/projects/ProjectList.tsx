// src/components/projects/ProjectList.tsx
'use client';

import { useState, Dispatch, SetStateAction } from 'react';
import { Project } from '@prisma/client';
import { toast } from 'react-hot-toast';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';

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

  const handleCreateProject = async (projectData: { name: string; description?: string }) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) throw new Error('Failed to create project');
      
      await onProjectUpdated();
      setShowCreateModal(false);
      toast.success('Project created successfully');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete project');

      await onProjectUpdated();
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Projects</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
}