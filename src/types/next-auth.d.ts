// src/types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
    }
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
  }
}

// Add this for logging activity types
declare global {
  interface UserActivity {
    userId: string;
    action: string;
    metadata?: Record<string, any>;
  }
}