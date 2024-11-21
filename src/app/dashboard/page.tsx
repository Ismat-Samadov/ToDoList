// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth.config';
import DashboardContent from './DashboardContent';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    console.error('No session or session user ID found');
    redirect('/auth/signin');
    return null; // Ensure no rendering happens after the redirect
  }

  console.log('Session found:', session.user);

  return <DashboardContent />;
}
