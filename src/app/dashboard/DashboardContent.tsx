// src/app/dashboard/DashboardContent.tsx
'use client';

import { useState } from 'react';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';
import Navigation from '@/components/Navigation';

export default function DashboardContent() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTaskAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Your Tasks</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <TaskForm onTaskAdded={handleTaskAdded} />
          </div>
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <TaskList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>
    </div>
  );
}