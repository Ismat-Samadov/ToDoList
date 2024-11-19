// src/components/Navigation.tsx
'use client';

import { signOut, useSession } from 'next-auth/react';

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Task Manager</h1>
        {session && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{session.user?.email}</span>
            <button
              onClick={() => signOut()}
              className="text-red-600 hover:text-red-800"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}