// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity } from '@/lib/logging';

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    async signIn({ user, account }) {
      try {
        // Use placeholder values since `req` is not directly available
        const ipAddress = 'IP Unavailable'; // Replace with actual logic in API middleware
        const userAgent = 'User-Agent Unavailable'; // Replace with actual logic in API middleware

        // Log user activity
        await logUserActivity({
          userId: user.id,
          action: 'LOGIN',
          metadata: {
            email: user.email,
            loginMethod: account?.provider || 'Unknown',
          },
          ipAddress,
          userAgent,
        });
      } catch (error) {
        console.error('Error logging sign-in activity:', error);
      }
      return true; // Allow sign-in to proceed
    },
  },
});

export { handler as GET, handler as POST };


