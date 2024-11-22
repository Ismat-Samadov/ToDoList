// src/components/tasks/TaskList.tsx
'use client';

import { useState, useEffect } from 'react';
import { Task } from '@prisma/client';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { logUserActivity } from '@/lib/logging';

interface CustomSession {
  user: {
    id: string;
    email?: string;
    name?: string;
  };
}

interface TaskListProps {
  refreshTrigger: number;
}

export default function TaskList({ refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession() as { data: CustomSession | null };

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (id: string, status: string) => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to update tasks');
      return;
    }

    // Optimistic update
    const oldTask = tasks.find(t => t.id === id);
    const oldStatus = oldTask?.status;
    
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === id ? { ...task, status } : task
      )
    );

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update task');

      // Log activity after successful update
      logUserActivity({
        userId: session.user.id,
        action: 'STATUS_CHANGE',
        metadata: {
          taskId: id,
          oldStatus,
          newStatus: status,
          timestamp: new Date().toISOString(),
        },
      }).catch(console.error); // Handle logging errors separately

      toast.success('Task status updated');
    } catch (error) {
      // Revert optimistic update on error
      setTasks(currentTasks =>
        currentTasks.map(task =>
          task.id === id ? { ...task, status: oldStatus } : task
        )
      );
      console.error('Error updating task status:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    if (!session?.user?.id) {
      toast.error('You must be logged in to delete tasks');
      return;
    }

    // Optimistic update
    const taskToDelete = tasks.find(t => t.id === id);
    setTasks(currentTasks => currentTasks.filter(task => task.id !== id));

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete task');

      // Log activity after successful deletion
      logUserActivity({
        userId: session.user.id,
        action: 'TASK_DELETE',
        metadata: {
          taskId: id,
          taskTitle: taskToDelete?.title,
          timestamp: new Date().toISOString(),
        },
      }).catch(console.error); // Handle logging errors separately

      toast.success('Task deleted');
    } catch (error) {
      // Revert optimistic update on error
      if (taskToDelete) {
        setTasks(currentTasks => [...currentTasks, taskToDelete]);
      }
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter((task) => (filter === 'ALL' ? true : task.status === filter));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Task List</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Tasks</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-gray-400">Loading tasks...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white">{task.title}</h3>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    task.priority === 'HIGH'
                      ? 'bg-red-900 text-red-200'
                      : task.priority === 'MEDIUM'
                      ? 'bg-yellow-900 text-yellow-200'
                      : 'bg-green-900 text-green-200'
                  }`}
                >
                  {task.priority}
                </span>
              </div>

              <p className="text-gray-300 text-sm mb-2">{task.description}</p>

              {task.dueDate && (
                <p className="text-sm text-gray-400 mb-2">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}

              <div className="flex justify-between items-center mt-4">
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                  className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!isLoading && filteredTasks.length === 0 && (
            <p className="text-gray-400 text-center py-4">No tasks found</p>
          )}
        </div>
      )}
    </div>
  );
}