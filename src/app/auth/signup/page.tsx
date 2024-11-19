// src/app/auth/signup/page.tsx
import SignUpForm from '@/components/auth/SignUpForm';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold">Create your account</h2>
          <p className="mt-2 text-center text-gray-600">
            Or{' '}
            <Link href="/auth/signin" className="text-blue-500 hover:text-blue-600">
              sign in to existing account
            </Link>
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}