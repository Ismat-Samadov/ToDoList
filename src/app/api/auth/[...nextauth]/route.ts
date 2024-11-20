// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth.config';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };



const authOptions: AuthOptions = {
 providers: [
   CredentialsProvider({
     name: 'credentials',
     credentials: {
       email: { label: "Email", type: "email" },
       password: { label: "Password", type: "password" }
     },
     async authorize(credentials) {
       if (!credentials?.email || !credentials?.password) {
         return null;
       }

       const user = await prisma.user.findUnique({
         where: { email: credentials.email }
       });

       if (!user || !await bcrypt.compare(credentials.password, user.password)) {
         return null;
       }

       return {
         id: user.id,
         email: user.email,
         name: user.name,
       };
     }
   })
 ],
 callbacks: {
   async session({ session, token }) {
     return {
       ...session,
       user: {
         ...session.user,
         id: token.sub
       }
     };
   }
 },
 session: { strategy: "jwt" },
 pages: {
   signIn: '/auth/signin',
 },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };