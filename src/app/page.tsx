// src/app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Task Manager</h1>
        <p className="text-gray-600">Organize your tasks efficiently</p>
        <div className="space-x-4">
          <Link 
            href="/auth/signin" 
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Sign In
          </Link>
          <Link 
            href="/auth/signup"
            className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-900"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}