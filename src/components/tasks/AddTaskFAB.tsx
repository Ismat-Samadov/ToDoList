// src/components/tasks/AddTaskFAB.tsx
'use client';

interface AddTaskFABProps {
  onClick: () => void;
}

export default function AddTaskFAB({ onClick }: AddTaskFABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed right-4 bottom-20 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg z-50"
      aria-label="Add new task"
    >
      <svg
        className="w-8 h-8 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}