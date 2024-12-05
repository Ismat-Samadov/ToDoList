// src/components/Navigation.tsx
'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#1a1f25] px-4 py-3">
      <div className="flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">MyFrog</span>
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </Link>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-white p-1"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {showMenu && (
        <div className="absolute top-full left-0 right-0 bg-[#1a1f25] border-t border-[#2f3641] p-4">
          {session?.user ? (
            <button
              onClick={() => signOut()}
              className="w-full text-left text-red-400 px-4 py-2 rounded-lg"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/auth/signin"
              className="block text-white px-4 py-2 rounded-lg"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}