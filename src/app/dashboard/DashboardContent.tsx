// src/app/dashboard/DashboardContent.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TaskList from '@/components/tasks/TaskList';
import TaskForm from '@/components/tasks/TaskForm';
import Navigation from '@/components/Navigation';
import { toast } from 'react-hot-toast';
import AddTaskFAB from '@/components/tasks/AddTaskFAB';

export default function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showMobileForm, setShowMobileForm] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      toast.error('You must be logged in to access the dashboard.');
      router.replace('/auth/signin');
      return;
    }

    setIsInitialLoading(false);
  }, [session, status, router]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Session expired. Please sign in again.');
      router.replace('/auth/signin');
    }
  }, [status, router]);

  const handleTaskAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
    setShowMobileForm(false);
    toast.success('Task added successfully!');
  };

  if (isInitialLoading || status === 'loading' || !session?.user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-[#1a1f25]"
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
    <div className="min-h-screen bg-[#1a1f25]">
      <Navigation />
      
      <main className="pt-16">
        {/* Subtitle */}
        <div className="px-4 pb-2">
          <p className="text-xl text-gray-400">
            Manage your tasks efficiently
          </p>
        </div>

        {/* Task List Container */}
        <div className="px-4">
          <section 
            className="bg-[#1e242c] rounded-2xl p-4"
            aria-label="Your tasks"
          >
            <TaskList 
              refreshTrigger={refreshTrigger}
            />
          </section>
        </div>

        {/* Add Task FAB */}
        <AddTaskFAB onClick={() => setShowMobileForm(true)} />

        {/* Task Form Modal */}
        {showMobileForm && (
          <div 
            className="fixed inset-0 bg-[#1a1f25] z-50 animate-in fade-in slide-in-from-bottom"
            aria-modal="true"
            role="dialog"
          >
            <nav className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">Add New Task</h2>
              <button
                onClick={() => setShowMobileForm(false)}
                className="p-2 text-gray-400"
                aria-label="Close modal"
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
            </nav>
            
            <div className="p-4 h-[calc(100vh-64px)] overflow-y-auto">
              <TaskForm onTaskAdded={handleTaskAdded} />
            </div>
          </div>
        )}

        {/* Safe Area Spacing */}
        <div className="h-24" />
      </main>
    </div>
  );
}