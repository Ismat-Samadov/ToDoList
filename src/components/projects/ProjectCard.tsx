// src/components/projects/ProjectCard.tsx
'use client';

import Link from 'next/link';
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
}

export default function ProjectCard({ 
  project, 
  isSelected = false,
  onSelect,
  onDelete 
}: ProjectCardProps) {
  return (
    <div 
      className={`bg-[#2f3641] rounded-xl p-6 space-y-4 cursor-pointer transition-colors ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-medium text-white">{project.name}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project.id);
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

      {project.description && (
        <p className="text-gray-400">{project.description}</p>
      )}

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