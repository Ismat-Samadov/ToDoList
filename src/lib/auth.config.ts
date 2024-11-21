// src/lib/auth.config.ts
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('Missing credentials:', credentials);
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          console.log('Login attempt:', {
            email: credentials.email,
            userFound: !!user,
          });

          if (!user) {
            console.error(`User not found: ${credentials.email}`);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.error(`Invalid password for user: ${credentials.email}`);
            return null;
          }

          console.log('Login successful:', {
            userId: user.id,
            email: user.email,
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Add user details to token
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user details from token to session
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
        };
      } else {
        console.error('Session token is missing.');
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
  },
  debug: true, // Enable debug logs for troubleshooting
};
