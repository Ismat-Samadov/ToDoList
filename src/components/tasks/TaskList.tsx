// src/components/tasks/TaskList.tsx
'use client';

import { useState, useEffect } from 'react';
import { Task } from '@prisma/client';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { logUserActivity } from '@/lib/logging';
import TaskEditModal from './TaskEditModal';

interface TaskListProps {
  refreshTrigger: number;
}

type TaskFilter = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export default function TaskList({ refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { data: session } = useSession();

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
    if (!session?.user?.id) return;

    const oldTask = tasks.find(t => t.id === id);
    if (!oldTask) return;

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
      toast.success('Task status updated');
      
    } catch (error) {
      setTasks(currentTasks =>
        currentTasks.map(task =>
          task.id === id ? { ...task, status: oldTask.status } : task
        )
      );
      toast.error('Failed to update task status');
    }
  };

  const updateTask = async (taskId: string, updatedData: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error('Failed to update task');

      const updatedTask = await res.json();
      setTasks(currentTasks =>
        currentTasks.map(task =>
          task.id === taskId ? updatedTask : task
        )
      );
      
      toast.success('Task updated successfully');
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    if (!session?.user?.id || !confirm('Delete this task?')) return;

    const taskToDelete = tasks.find(t => t.id === id);
    if (!taskToDelete) return;

    setTasks(currentTasks => currentTasks.filter(task => task.id !== id));

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      toast.success('Task deleted successfully');
    } catch (error) {
      setTasks(prev => [...prev, taskToDelete]);
      toast.error('Failed to delete task');
    }
  };

  const handleFilterChange = () => {
    const filters: TaskFilter[] = ['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];
    const currentIndex = filters.indexOf(filter);
    const nextIndex = (currentIndex + 1) % filters.length;
    setFilter(filters[nextIndex]);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'ALL') return true;
    return task.status === filter;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">Task List</h2>
        <button 
          onClick={handleFilterChange}
          className="px-6 py-2 bg-[#2f3641] text-gray-300 rounded-full text-sm"
        >
          {filter === 'ALL' ? 'All Tasks' : 
           filter === 'IN_PROGRESS' ? 'In Progress' : 
           filter.charAt(0) + filter.slice(1).toLowerCase()}
        </button>
      </div>

      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <p className="text-center text-gray-400 py-4">No tasks found</p>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="bg-[#2f3641] rounded-2xl p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg text-white font-normal">{task.title}</h3>
                <span
                  className={`px-3 py-1 rounded-md text-white text-sm ${
                    task.priority === 'HIGH' ? 'bg-red-800' :
                    task.priority === 'MEDIUM' ? 'bg-[#8B4513]' :
                    'bg-[#006400]'
                  }`}
                >
                  {task.priority}
                </span>
              </div>

              <p className="text-gray-400 text-base mb-2">{task.description}</p>

              {task.dueDate && (
                <p className="text-gray-400 text-base mb-4">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}

              <div className="flex justify-between items-center gap-2">
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                  className="bg-[#1e242c] text-white px-4 py-2 rounded-xl flex-1 text-base"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <button
                  onClick={() => setEditingTask(task)}
                  className="text-blue-400 text-base px-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-400 text-base px-3"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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