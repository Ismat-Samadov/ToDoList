// src/app/dashboard/DashboardContent.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';
import Navigation from '@/components/Navigation';
import { toast } from 'react-hot-toast';

export default function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load
    if (!session?.user) {
      toast.error('You must be logged in to access the dashboard.');
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  const handleTaskAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (status === 'loading' || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

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
