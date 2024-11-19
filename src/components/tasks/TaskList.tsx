// src/components/tasks/TaskList.tsx
'use client';

import { useEffect, useState } from 'react';
import { Task } from '@prisma/client';

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  const updateTaskStatus = async (id: string, status: string) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchTasks();
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
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
          
          <select
            value={task.status}
            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm"
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      ))}
    </div>
  );
}