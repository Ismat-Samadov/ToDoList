// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity } from '@/lib/logging';

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    async signIn({ user, account, context }) {
      try {
        // Extract metadata from query parameters
        const ipAddress = context?.req?.url
          ? new URL(context.req.url).searchParams.get('x-client-ip') || 'IP Unavailable'
          : 'IP Unavailable';
        const userAgent = context?.req?.url
          ? new URL(context.req.url).searchParams.get('x-user-agent') || 'User-Agent Unavailable'
          : 'User-Agent Unavailable';

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

