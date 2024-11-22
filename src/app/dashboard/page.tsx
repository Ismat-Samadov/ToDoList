// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth.config';
import DashboardContent from './DashboardContent';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function validateSession() {
  try {
    const session = await getServerSession(authOptions);
    const headersList = headers();
    
    // Check for required session data
    if (!session?.user?.id) {
      throw new Error('Invalid session');
    }

    // Additional security checks can be added here
    return session;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export default async function DashboardPage() {
  try {
    // Validate session
    const session = await validateSession();
    
    if (!session) {
      redirect('/auth/signin');
    }

    // Metadata for logging/debugging
    const timestamp = new Date().toISOString();
    console.log(`Dashboard accessed by user ${session.user.id} at ${timestamp}`);

    return (
      <>
        {/* Add meta tags for dashboard */}
        <meta name="robots" content="noindex,nofollow" />
        <DashboardContent />
      </>
    );
  } catch (error) {
    console.error('Error in DashboardPage:', error);
    
    // Log the error details but don't expose them to the client
    const errorDetails = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      path: '/dashboard'
    };
    console.error('Dashboard error details:', errorDetails);

    redirect('/auth/signin');
  }
}