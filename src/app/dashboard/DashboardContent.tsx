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
  const [showMobileForm, setShowMobileForm] = useState(false);

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
    setShowMobileForm(false);
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
        className="container mx-auto px-4 py-8 pb-20 md:pb-8"
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

        {/* Mobile Add Task Button */}
        <button
          onClick={() => setShowMobileForm(true)}
          className="fixed right-4 bottom-20 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg z-50 md:hidden"
          aria-label="Add new task"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>

        {/* Mobile Form Modal */}
        {showMobileForm && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 md:hidden">
            <div className="h-full overflow-y-auto px-4 py-16">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Add New Task</h2>
                  <button
                    onClick={() => setShowMobileForm(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <TaskForm onTaskAdded={handleTaskAdded} />
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <section 
            className="hidden md:block bg-gray-800 rounded-xl p-6 shadow-lg"
            aria-label="Create new task"
          >
            <TaskForm 
              onTaskAdded={handleTaskAdded} 
            />
          </section>

          <section 
            className="bg-gray-800 rounded-xl p-6 shadow-lg md:col-span-1"
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