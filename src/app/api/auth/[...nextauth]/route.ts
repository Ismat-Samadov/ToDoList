// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { logUserActivity } from '@/lib/logging';

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    async signIn({ user, account }) {
      try {
        // Log user activity with placeholder metadata
        await logUserActivity({
          userId: user.id,
          action: 'LOGIN',
          metadata: {
            email: user.email,
            loginMethod: account.provider,
          },
          ipAddress: 'IP Unavailable', // Placeholder for IP
          userAgent: 'User-Agent Unavailable', // Placeholder for User-Agent
        });
        return true; // Allow sign-in to proceed
      } catch (error) {
        console.error('Error logging user activity:', error);
        return false; // Deny sign-in on failure
      }
    },
  },
  events: {
    async signIn({ user, req }) {
      try {
        const ipAddress =
          req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || 'Unknown IP';
        const userAgent = req.headers['user-agent'] || 'Unknown User-Agent';

        // Log user activity with real metadata
        await logUserActivity({
          userId: user.id,
          action: 'LOGIN',
          metadata: {
            email: user.email,
          },
          ipAddress,
          userAgent,
        });
      } catch (error) {
        console.error('Error logging user activity in events:', error);
      }
    },
  },
});

export { handler as GET, handler as POST };

