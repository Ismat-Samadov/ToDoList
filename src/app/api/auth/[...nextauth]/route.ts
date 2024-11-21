// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity } from '@/lib/logging';

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    ...authOptions.callbacks,
    async signIn({ user, account }) {
      try {
        await logUserActivity({
          userId: user.id,
          action: 'LOGIN',
          metadata: {
            email: user.email,
            loginMethod: account?.provider || 'credentials',
          }
        });
      } catch (error) {
        console.error('Error logging sign-in activity:', error);
      }
      return true;
    }
  }
});

export { handler as GET, handler as POST };


