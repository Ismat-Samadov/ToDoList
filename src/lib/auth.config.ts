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
       email: { label: "Email", type: "email" },
       password: { label: "Password", type: "password" }
     },
     async authorize(credentials) {
       try {
         if (!credentials?.email || !credentials?.password) {
           console.log('Missing credentials');
           return null;
         }

         const user = await prisma.user.findUnique({
           where: { email: credentials.email }
         });

         console.log('Login attempt:', {
           email: credentials.email,
           userFound: !!user
         });

         if (!user || !await bcrypt.compare(credentials.password, user.password)) {
           console.log('Invalid credentials');
           return null;
         }

         console.log('Login successful:', {
           userId: user.id,
           email: user.email
         }npx prisma migrate reset
);

         return {
           id: user.id,
           email: user.email,
           name: user.name,
         };
       } catch (error) {
         console.error('Auth error:', error);
         return null;
       }
     }
   })
 ],
 callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
    }
    return token;
  },
  async session({ session, token }) {
    if (token && session.user) {
      session.user.id = token.id as string;
    }
    return session;
  }
},
 session: { strategy: "jwt" },
 pages: {
   signIn: '/auth/signin',
 },
 debug: true // Enable debug logs
};