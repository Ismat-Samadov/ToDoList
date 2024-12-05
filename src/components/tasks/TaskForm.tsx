// src/components/tasks/TaskForm.tsx
'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { logClientActivity } from '@/lib/logging';

interface TaskFormProps {
  projectId: string;
  onTaskAdded: () => void;
  isDisabled?: boolean;
}

export default function TaskForm({ projectId, onTaskAdded, isDisabled = false }: TaskFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const { data: session } = useSession();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [dueDate, setDueDate] = useState(today);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) {
      toast.error('You must be logged in to create tasks.');
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate,
        projectId
      };

      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create task');
      }

      const task = await res.json();

      await logClientActivity({
        userId: session.user.id,
        action: 'TASK_CREATE',
        metadata: {
          taskId: task.id,
          projectId,
          title: task.title,
          priority: task.priority,
          dueDate: task.dueDate,
          timestamp: new Date().toISOString()
        }
      });

      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setDueDate(today);
      onTaskAdded();
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task. Please try again.');
      await logClientActivity({
        userId: session.user.id,
        action: 'TASK_CREATE',
        metadata: {
          error: 'Failed to create task',
          projectId,
          timestamp: new Date().toISOString()
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-[#1e242c] rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          required
          disabled={isSubmitting || isDisabled}
          placeholder="Task Title"
          minLength={1}
          maxLength={255}
        />
      </div>

      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 bg-[#1e242c] rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          disabled={isSubmitting || isDisabled}
          placeholder="Task Description"
          maxLength={1000}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
            className="w-full px-4 py-3 bg-[#1e242c] rounded-xl text-white focus:ring-2 focus:ring-blue-500 appearance-none"
            disabled={isSubmitting || isDisabled}
          >
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
          </select>
        </div>

        <div>
          <input
            type="date"
            value={dueDate}
            min={today}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-3 bg-[#1e242c] rounded-xl text-white focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting || isDisabled}
          />
        </div>
      </div>

      <button
        type="submit"
        className={`w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors
          ${(isSubmitting || isDisabled) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        disabled={isSubmitting || isDisabled}
      >
        {isSubmitting ? 'Creating Task...' : 'Create Task'}
      </button>
    </form>
  );
}