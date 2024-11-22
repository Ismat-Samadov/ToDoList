// src/lib/auth.config.ts
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { logUserActivity } from '@/lib/logging';

// Rate limiting implementation
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const limit = 5; // attempts
  const windowMs = 15 * 60 * 1000; // 15 minutes

  const userAttempts = rateLimitMap.get(identifier) || { count: 0, timestamp: now };

  if (now - userAttempts.timestamp > windowMs) {
    userAttempts.count = 1;
    userAttempts.timestamp = now;
  } else {
    userAttempts.count += 1;
  }

  rateLimitMap.set(identifier, userAttempts);
  return userAttempts.count <= limit;
};

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Missing credentials');
          }

          // Rate limiting check
          const headersList = headers();
          const clientIp = headersList.get('x-forwarded-for') || 
                          headersList.get('x-real-ip') || 
                          '127.0.0.1';

          if (!checkRateLimit(`${clientIp}:${credentials.email}`)) {
            throw new Error('Too many login attempts');
          }

          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email.toLowerCase().trim()
            },
            select: {
              id: true,
              email: true,
              password: true,
              name: true,
              isDeleted: true
            }
          });

          if (!user || user.isDeleted || !user.password) {
            throw new Error('Invalid credentials');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid credentials');
          }

          // Log successful login
          await logUserActivity({
            userId: user.id,
            action: 'LOGIN',
            metadata: {
              email: user.email,
              loginMethod: 'credentials',
              timestamp: new Date().toISOString()
            },
            ipAddress: clientIp,
            userAgent: headersList.get('user-agent') || 'Unknown'
          }).catch(console.error); // Non-blocking error handling

          return {
            id: user.id,
            email: user.email,
            name: user.name
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw error; // Propagate error for proper handling
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};