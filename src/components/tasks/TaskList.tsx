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

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export default function TaskList({ refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'ALL' | TaskStatus>('ALL');
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

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to update tasks');
      return;
    }

    const oldTask = tasks.find(t => t.id === id);
    if (!oldTask) return;

    const oldStatus = oldTask.status as TaskStatus;
    
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

      logUserActivity({
        userId: session.user.id,
        action: 'STATUS_CHANGE',
        metadata: {
          taskId: id,
          oldStatus,
          newStatus: status,
          timestamp: new Date().toISOString(),
        },
      }).catch(console.error);

      toast.success('Task status updated');
    } catch (error) {
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

    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;

    setTasks(currentTasks => currentTasks.filter(task => task.id !== id));

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete task');

      logUserActivity({
        userId: session.user.id,
        action: 'TASK_DELETE',
        metadata: {
          taskId: id,
          taskTitle: taskToDelete.title,
          timestamp: new Date().toISOString(),
        },
      }).catch(console.error);

      toast.success('Task deleted');
    } catch (error) {
      setTasks(currentTasks => [...currentTasks, taskToDelete]);
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter((task) => 
    filter === 'ALL' ? true : task.status === filter
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">
          Task List
        </h2>
        <button
          className="px-6 py-2 bg-[#2a3138] rounded-full text-gray-300 text-sm"
          onClick={() => setFilter('ALL')}
        >
          All Tasks
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-gray-300">Loading tasks...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className="bg-[#2a3138] p-4 rounded-xl"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg text-white">
                  {task.title}
                </h3>
                <span
                  className={`px-3 py-1 rounded-md text-white ${
                    task.priority === 'HIGH'
                      ? 'bg-red-800'
                      : task.priority === 'MEDIUM'
                      ? 'bg-[#8B4513]'
                      : 'bg-[#006400]'
                  }`}
                >
                  {task.priority}
                </span>
              </div>

              <p className="text-gray-400 mb-2">
                {task.description}
              </p>

              {task.dueDate && (
                <p className="text-gray-400 mb-4">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}

              <div className="flex justify-between items-center">
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                  className="bg-[#1e242c] text-white px-4 py-2 rounded-lg w-3/4"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {!isLoading && filteredTasks.length === 0 && (
            <p className="text-gray-400 text-center py-4">
              No tasks found
            </p>
          )}
        </div>
      )}
    </div>
  );
}