// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity } from '@/lib/logging';

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    async signIn({ user, account }) {
      try {
        // Extract IP and User-Agent from headers if available
        const ipAddress = 'IP Unavailable'; // Add actual IP capture logic later if needed
        const userAgent = 'User-Agent Unavailable'; // Placeholder

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
