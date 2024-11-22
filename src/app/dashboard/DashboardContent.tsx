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
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    if (status === 'loading') return;

    if (!session?.user) {
      toast.error('You must be logged in to access the dashboard.');
      router.replace('/auth/signin');
      return;
    }

    setIsInitialLoading(false);
  }, [session, status, router]);

  // Monitor session status for changes
  useEffect(() => {
    const checkSession = async () => {
      if (status === 'unauthenticated') {
        toast.error('Session expired. Please sign in again.');
        router.replace('/auth/signin');
      }
    };

    checkSession();
  }, [status, router]);

  const handleTaskAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
    toast.success('Task added successfully!');
  };

  // Show loading state
  if (isInitialLoading || status === 'loading' || !session?.user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-gray-900"
        role="status"
        aria-label="Loading dashboard"
      >
        <div className="text-center text-white">
          <p className="text-lg">Loading...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we set up your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <main 
        className="container mx-auto px-4 py-8"
        role="main"
        aria-label="Dashboard content"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Welcome, {session.user.name || 'User'}
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your tasks efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <section 
            className="bg-gray-800 rounded-xl p-6 shadow-lg"
            aria-label="Create new task"
          >
            <TaskForm 
              onTaskAdded={handleTaskAdded} 
            />
          </section>

          <section 
            className="bg-gray-800 rounded-xl p-6 shadow-lg"
            aria-label="Your tasks"
          >
            <TaskList 
              refreshTrigger={refreshTrigger}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

