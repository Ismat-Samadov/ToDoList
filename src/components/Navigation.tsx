// src/components/Navigation.tsx
'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="z-50">
      <nav 
        className="bg-[#1a1f25] px-4 py-3"
        role="navigation" 
        aria-label="Main navigation"
      >
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2"
            aria-label="Go to Dashboard"
          >
            <span className="text-2xl font-bold text-white">
              MyFrog
            </span>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </Link>
          
          {/* Mobile Menu Button */}
          <button
            className="p-2 text-white"
            onClick={() => setShowMenu(!showMenu)}
            aria-label={showMenu ? "Close menu" : "Open menu"}
            aria-expanded={showMenu}
          >
            {showMenu ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="absolute top-full left-0 right-0 bg-[#1a1f25] border-t border-gray-800">
            <div className="p-4 space-y-4">
              {session?.user ? (
                <>
                  <div className="px-2">
                    <div className="text-sm text-gray-400">Signed in as</div>
                    <div className="text-sm text-white truncate">
                      {session.user.email}
                    </div>
                  </div>
                  <div className="border-t border-gray-800 pt-4">
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-4 py-2 text-red-400 rounded-lg flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                        />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Link 
                    href="/auth/signin"
                    className="block px-4 py-2 text-white rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="block px-4 py-2 bg-blue-600 text-white rounded-lg text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}