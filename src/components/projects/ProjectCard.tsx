// src/components/projects/ProjectCard.tsx
'use client';

import { useState } from 'react';
import { Project } from '@prisma/client';

interface ProjectWithCount extends Project {
  _count: {
    tasks: number;
  };
}

interface ProjectCardProps {
  project: ProjectWithCount;
  isSelected?: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { name: string; description?: string }) => Promise<void>;
}

export default function ProjectCard({ 
  project, 
  isSelected = false,
  onSelect,
  onDelete,
  onUpdate
}: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdate(project.id, {
        name: name.trim(),
        description: description.trim() || undefined
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-[#2f3641] rounded-xl p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-[#1e242c] rounded-lg text-white"
            placeholder="Project name"
            required
            disabled={isSubmitting}
          />
          
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-[#1e242c] rounded-lg text-white min-h-[100px]"
            placeholder="Project description (optional)"
            disabled={isSubmitting}
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-400 hover:text-white"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div 
      className={`bg-[#2f3641] rounded-xl p-6 space-y-4 cursor-pointer transition-colors ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-medium text-white">{project.name}</h3>
          {project.description && (
            <p className="text-gray-400 mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="text-blue-400 hover:text-blue-300 transition-colors"
            aria-label="Edit project"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this project?')) {
                onDelete(project.id);
              }
            }}
            className="text-red-400 hover:text-red-300 transition-colors"
            aria-label="Delete project"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-gray-400">
          {project._count.tasks} {project._count.tasks === 1 ? 'task' : 'tasks'}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
        >
          View Tasks
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}