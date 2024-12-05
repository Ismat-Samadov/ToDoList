// src/components/projects/TaskCreateButton.tsx

'use client';

import { Plus } from 'lucide-react';

interface TaskCreateButtonProps {
  onClick: () => void;
}

export default function TaskCreateButton({ onClick }: TaskCreateButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed right-4 bottom-20 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
      aria-label="Create new task"
    >
      <Plus className="w-6 h-6 text-white" />
    </button>
  );
}