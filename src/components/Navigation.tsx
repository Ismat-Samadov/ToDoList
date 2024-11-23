// src/components/Navigation.tsx
'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav 
        className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-800/95 backdrop-blur-sm border-b border-gray-700/50" 
        role="navigation" 
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 group"
              aria-label="Go to Dashboard"
            >
              <span className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                MyFrog
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {session?.user && (
                <>
                  <span 
                    className="text-gray-300 truncate max-w-[200px]"
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
                    className="px-4 py-2 text-white hover:text-blue-400 transition-colors"
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

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowMenu(!showMenu)}
              aria-label={showMenu ? "Close menu" : "Open menu"}
              aria-expanded={showMenu}
            >
              {showMenu ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMenu && (
            <div className="md:hidden pt-4 pb-3 border-t border-gray-700 mt-4">
              {session?.user ? (
                <div className="space-y-4">
                  <div className="px-2 flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-400">Signed in as</span>
                    <span className="text-sm text-white truncate">
                      {session.user.email}
                    </span>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                        />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link 
                    href="/auth/signin"
                    className="block px-4 py-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Gradient border bottom */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
    </header>
  );
}