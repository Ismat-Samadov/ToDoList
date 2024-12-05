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
    if (status === 'loading') return;
    if (!session?.user) {
      toast.error('You must be logged in to access the dashboard.');
      router.replace('/auth/signin');
      return;
    }
    setIsInitialLoading(false);
  }, [session, status, router]);

  if (isInitialLoading || status === 'loading' || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1f25]">
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
      
      <main className="px-4">
        <div className="pt-20 pb-4">
          <p className="text-[#94a3b8] text-xl">
            Manage your tasks efficiently
          </p>
        </div>

        <TaskList refreshTrigger={refreshTrigger} />

        {/* Add Task Button */}
        <button
          onClick={() => setShowMobileForm(true)}
          className="fixed right-4 bottom-20 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg z-50"
          aria-label="Add new task"
        >
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v12m6-6H6"
            />
          </svg>
        </button>

        {/* Add Task Modal */}
        {showMobileForm && (
          <div className="fixed inset-0 bg-[#1a1f25] z-50">
            <div className="flex flex-col h-full">
              <div className="px-4 py-3 flex items-center justify-between border-b border-[#2f3641]">
                <h2 className="text-xl font-semibold text-white">Add New Task</h2>
                <button
                  onClick={() => setShowMobileForm(false)}
                  className="text-gray-400 p-1"
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
              <div className="flex-1 overflow-y-auto p-4">
                <TaskForm onTaskAdded={() => {
                  setRefreshTrigger(prev => prev + 1);
                  setShowMobileForm(false);
                  toast.success('Task added successfully!');
                }} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom spacing for mobile browsers */}
      <div className="h-28" />
    </div>
  );
}