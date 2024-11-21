// src/app/auth/signup/page.tsx
import SignUpForm from '@/components/auth/SignUpForm';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-bold text-white hover:text-gray-200">
          MyFrog
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Create an account</h2>
            <p className="mt-2 text-gray-400">
              Start managing your tasks effectively
            </p>
          </div>
          <SignUpForm />
          <div className="text-center text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-blue-500 hover:text-blue-400">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

