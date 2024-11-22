// src/components/Navigation.tsx
'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <header>
      <nav 
        className="bg-gray-800 border-b border-gray-700" 
        role="navigation" 
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link 
              href="/dashboard" 
              className="text-xl font-bold text-white hover:text-gray-200 transition-colors"
              aria-label="Go to Dashboard"
            >
              MyFrog
            </Link>
            
            <div className="flex items-center gap-4">
              {session?.user && (
                <>
                  <span 
                    className="text-gray-300"
                    aria-label={`Logged in as ${session.user.email}`}
                  >
                    {session.user.email}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    aria-label="Sign out of your account"
                  >
                    Sign Out
                  </button>
                </>
              )}
              {!session && (
                <>
                  <Link 
                    href="/auth/signin"
                    className="px-4 py-2 text-white hover:text-gray-200 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}