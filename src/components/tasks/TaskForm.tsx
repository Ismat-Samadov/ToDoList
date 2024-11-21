// src/components/tasks/TaskForm.tsx
'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { logUserActivity } from '@/lib/logging';
import { useSession } from 'next-auth/react';

// Add session type
interface CustomSession {
  user: {
    id: string;
    email?: string;
    name?: string;
  };
}

interface TaskFormProps {
  onTaskAdded: () => void;
}

export default function TaskForm({ onTaskAdded }: TaskFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const { data: session, status } = useSession() as { data: CustomSession | null; status: 'authenticated' | 'unauthenticated' | 'loading' };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [dueDate, setDueDate] = useState(today);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Handle session loading or invalid session state
    if (status === 'loading') {
      toast.error('Session is still loading. Please wait and try again.');
      return;
    }

    if (!session?.user?.id) {
      toast.error('You must be logged in to create tasks.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority, dueDate }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Task creation error:', errorData);
        throw new Error(errorData.message || 'Failed to create task');
      }

      const task = await res.json();

      // Log user activity
      try {
        await logUserActivity({
          userId: session.user.id,
          action: 'TASK_CREATE',
          metadata: {
            taskId: task.id,
            title: task.title,
            priority: task.priority,
            dueDate: task.dueDate,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (logError) {
        console.error('Failed to log task creation activity:', logError);
      }

      toast.success('Task created successfully!');
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setDueDate(today);
      onTaskAdded();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
        <div className="flex gap-2">
          <input
            type="date"
            value={dueDate}
            min={today}
            onChange={(e) => setDueDate(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setDueDate(today)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            disabled={isSubmitting}
          >
            Today
          </button>
        </div>
      </div>

      <button
        type="submit"
        className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Adding Task...' : 'Add Task'}
      </button>
    </form>
  );
}
