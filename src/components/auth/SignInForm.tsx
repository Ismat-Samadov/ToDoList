'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { logUserActivity } from '@/lib/logging';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid credentials');
      } else {
        await logUserActivity({
          userId: result?.ok ? email : '',
          action: 'LOGIN',
          metadata: {
            email,
            timestamp: new Date().toISOString()
          }
        });
        
        toast.success('Welcome back!');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

 return (
   <form onSubmit={handleSubmit} className="mt-8 space-y-6">
     <div className="space-y-4">
       <div>
         <label htmlFor="email" className="block text-sm font-medium text-gray-300">
           Email
         </label>
         <input
           id="email"
           type="email"
           required
           value={email}
           onChange={(e) => setEmail(e.target.value)}
           className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
           placeholder="you@example.com"
         />
       </div>

       <div>
         <label htmlFor="password" className="block text-sm font-medium text-gray-300">
           Password
         </label>
         <input
           id="password"
           type="password"
           required
           value={password}
           onChange={(e) => setPassword(e.target.value)}
           className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
           placeholder="••••••••"
         />
       </div>
     </div>

     <button
       type="submit"
       disabled={isLoading}
       className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
         isLoading ? 'opacity-50 cursor-not-allowed' : ''
       }`}
     >
       {isLoading ? 'Signing in...' : 'Sign in'}
     </button>
   </form>
 );
}