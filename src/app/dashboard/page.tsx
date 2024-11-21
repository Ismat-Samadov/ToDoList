// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth.config';
import DashboardContent from './DashboardContent';

export default async function DashboardPage() {
  try {
    // Get the session from the server
    const session = await getServerSession(authOptions);

    // Redirect to the sign-in page if no session or user ID is found
    if (!session || !session.user?.id) {
      console.error('No session or session user ID found');
      redirect('/auth/signin');
      return null; // Ensure no rendering happens after the redirect
    }

    console.log('Session found:', session.user);

    // Pass session to the DashboardContent if needed for rendering
    return <DashboardContent />;
  } catch (error) {
    console.error('Error fetching session:', error);
    // Optionally redirect to a generic error page or the sign-in page
    redirect('/auth/signin');
    return null;
  }
}
