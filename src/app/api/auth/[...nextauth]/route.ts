// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity } from '@/lib/logging';
import { NextAuthOptions } from 'next-auth';

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    async signIn({ user, account, req }) {
      try {
        // Extract IP and User-Agent from the incoming request
        const ipAddress =
          req?.headers['x-forwarded-for']?.toString()?.split(',')[0] ||
          req?.socket?.remoteAddress ||
          'IP Unavailable';

        const userAgent =
          req?.headers['user-agent'] || 'User-Agent Unavailable';

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
} as NextAuthOptions);

export { handler as GET, handler as POST };

