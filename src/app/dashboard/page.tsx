// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth.config';
import DashboardContent from './DashboardContent';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function DashboardPage() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      redirect('/auth/signin');
    }

    return <DashboardContent />;
  } catch (error) {
    console.error('Error in DashboardPage:', error);
    redirect('/auth/signin');
  }
}