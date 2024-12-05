// src/components/tasks/TaskEditModal.tsx
'use client';

import { useState } from 'react';
import { Task } from '@prisma/client';

interface TaskEditModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (taskId: string, updatedData: Partial<Task>) => Promise<void>;
}

export default function TaskEditModal({ task, onClose, onUpdate }: TaskEditModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onUpdate(task.id, {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1a1f25] z-50">
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 flex items-center justify-between border-b border-[#2f3641]">
          <h2 className="text-xl font-semibold text-white">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 p-1"
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#1e242c] rounded-xl text-white"
              placeholder="Task Title"
              required
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-[#1e242c] rounded-xl text-white min-h-[100px]"
              placeholder="Task Description"
            />

            <div className="grid grid-cols-2 gap-4">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                className="w-full px-4 py-3 bg-[#1e242c] rounded-xl text-white"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#1e242c] rounded-xl text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}