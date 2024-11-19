// src/components/tasks/TaskList.tsx
'use client';

import { useEffect, useState } from 'react';
import { Task } from '@prisma/client';
import { toast } from 'react-hot-toast';

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    }
  };

  const updateTaskStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update task');
      
      toast.success('Task updated successfully!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete task');
      
      toast.success('Task deleted successfully!');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(task => 
    filter === 'ALL' ? true : task.status === filter
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Your Tasks</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-3 py-1 border rounded-md"
        >
          <option value="ALL">All Tasks</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {filteredTasks.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No tasks found</p>
      ) : (
        filteredTasks.map((task) => (
          <div key={task.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{task.title}</h3>
              <span className={`px-2 py-1 rounded text-sm ${
                task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-2">{task.description}</p>
            
            {task.dueDate && (
              <p className="text-sm text-gray-500 mb-2">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </p>
            )}
            
            <div className="flex justify-between items-center mt-4">
              <select
                value={task.status}
                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}