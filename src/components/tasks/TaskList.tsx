// src/components/tasks/TaskList.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, Status, Priority } from '@prisma/client';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TaskEditModal from './TaskEditModal';
import { logClientActivity } from '@/lib/logging';

interface TaskListProps {
  projectId: string;
  refreshTrigger: number;
}

interface UpdateTaskData {
  status?: Status;
  priority?: Priority;
  title?: string;
  description?: string | null;
  dueDate?: Date | null;
}

export default function TaskList({ projectId, refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Status | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const fetchTasks = useCallback(async () => {
    if (!session?.user?.id || !projectId) return;
    
    setIsLoading(true);
    setIsError(false);
    
    try {
      const res = await fetch(`/api/tasks?projectId=${projectId}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (res.status === 401) {
        router.push('/auth/signin');
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch tasks');
      
      const data = await res.json();
      setTasks(data);
      
      await logClientActivity({
        userId: session.user.id,
        action: 'TASK_FETCH',
        metadata: {
          projectId,
          taskCount: data.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setIsError(true);
      toast.error('Failed to fetch tasks');
      await logClientActivity({
        userId: session.user.id,
        action: 'TASK_FETCH',
        metadata: {
          projectId,
          error: 'Failed to fetch tasks',
          timestamp: new Date().toISOString()
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, projectId, router]);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchTasks();
    }
  }, [sessionStatus, fetchTasks, refreshTrigger]);

  const updateTaskStatus = async (taskId: string, newStatus: Status) => {
    if (!session?.user?.id) return;

    const oldTask = tasks.find(t => t.id === taskId);
    if (!oldTask) return;

    try {
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      setTasks(updatedTasks);

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) throw new Error('Failed to update task');

      await logClientActivity({
        userId: session.user.id,
        action: 'STATUS_CHANGE',
        metadata: {
          taskId,
          projectId,
          oldStatus: oldTask.status,
          newStatus,
          timestamp: new Date().toISOString()
        }
      });

      toast.success('Task status updated');
    } catch (error) {
      setTasks(tasks); // Revert on error
      toast.error('Failed to update task status');
      await logClientActivity({
        userId: session.user.id,
        action: 'STATUS_CHANGE',
        metadata: {
          taskId,
          projectId,
          error: 'Failed to update status',
          timestamp: new Date().toISOString()
        }
      });
    }
  };

  const updateTask = async (taskId: string, updatedData: UpdateTaskData) => {
    if (!session?.user?.id) return;
    
    try {
      const oldTask = tasks.find(t => t.id === taskId);
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error('Failed to update task');

      const updatedTask = await res.json();
      setTasks(tasks.map(task =>
        task.id === taskId ? updatedTask : task
      ));
      
      await logClientActivity({
        userId: session.user.id,
        action: 'TASK_UPDATE',
        metadata: {
          taskId,
          projectId,
          updates: updatedData,
          oldTask,
          timestamp: new Date().toISOString()
        }
      });

      toast.success('Task updated successfully');
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      await logClientActivity({
        userId: session.user.id,
        action: 'TASK_UPDATE',
        metadata: {
          taskId,
          projectId,
          error: 'Failed to update task',
          timestamp: new Date().toISOString()
        }
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!session?.user?.id || !confirm('Delete this task?')) return;

    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    setTasks(tasks.filter(task => task.id !== taskId));

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete task');

      await logClientActivity({
        userId: session.user.id,
        action: 'TASK_DELETE',
        metadata: {
          taskId,
          projectId,
          taskTitle: taskToDelete.title,
          timestamp: new Date().toISOString()
        }
      });

      toast.success('Task deleted successfully');
    } catch (error) {
      setTasks(prev => [...prev, taskToDelete]);
      toast.error('Failed to delete task');
      await logClientActivity({
        userId: session.user.id,
        action: 'TASK_DELETE',
        metadata: {
          taskId,
          projectId,
          error: 'Failed to delete task',
          timestamp: new Date().toISOString()
        }
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'ALL') return true;
    return task.status === filter;
  });

  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-48">
        <p className="text-gray-400 mb-4">Loading tasks...</p>
        {isError && (
          <button 
            onClick={fetchTasks}
            className="text-blue-400 hover:text-blue-300 text-sm px-4 py-2 rounded-lg border border-blue-400 hover:border-blue-300"
          >
            Retry Loading
          </button>
        )}
      </div>
    );
  }

  if (sessionStatus === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium text-white">Tasks</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchTasks}
            className="text-gray-400 hover:text-white transition-colors"
            title="Refresh tasks"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Status | 'ALL')}
            className="px-4 py-2 bg-[#2f3641] text-gray-300 rounded-lg text-sm"
          >
            <option value="ALL">All Tasks</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 bg-[#2f3641] rounded-xl">
          <p className="text-gray-400">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-[#2f3641] rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg text-white font-normal">{task.title}</h3>
                <span className={`px-3 py-1 rounded-md text-white text-sm ${
                  task.priority === 'HIGH' ? 'bg-red-800' :
                  task.priority === 'MEDIUM' ? 'bg-[#8B4513]' :
                  'bg-[#006400]'
                }`}>
                  {task.priority}
                </span>
              </div>

              {task.description && (
                <p className="text-gray-400 text-sm mb-2">{task.description}</p>
              )}

              {task.dueDate && (
                <p className="text-gray-400 text-sm mb-4">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}

              <div className="flex justify-between items-center gap-2">
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value as Status)}
                  className="bg-[#1e242c] text-white px-3 py-1.5 rounded-lg flex-1 text-sm"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                
                <button
                  onClick={() => setEditingTask(task)}
                  className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1.5"
                >
                  Edit
                </button>
                
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-400 hover:text-red-300 text-sm px-3 py-1.5"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdate={updateTask}
        />
      )}
    </div>
  );
}