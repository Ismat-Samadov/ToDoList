// src/app/dashboard/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';
import DashboardContent from './DashboardContent';
import { Project, Task } from '@prisma/client';
import { logUserActivity } from '@/lib/logging';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function validateSession() {
  try {
    const session = await getServerSession(authOptions);
    const headersList = headers();
    
    if (!session?.user?.id) {
      throw new Error('Invalid session');
    }

    const clientIp = headersList.get('x-forwarded-for') || 
                    headersList.get('x-real-ip') || 
                    'Unknown IP';
    const userAgent = headersList.get('user-agent') || 'Unknown User-Agent';

    await logUserActivity({
      userId: session.user.id,
      action: 'DASHBOARD_ACCESS',
      metadata: {
        timestamp: new Date().toISOString(),
        clientIp,
        userAgent
      },
      ipAddress: clientIp,
      userAgent
    });

    return session;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export default async function DashboardPage() {
  try {
    const session = await validateSession();
    
    if (!session) {
      redirect('/auth/signin');
    }

    return (
      <>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="description" content="Project and task management dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        
        <DashboardContent />
      </>
    );
  } catch (error) {
    console.error('Error in DashboardPage:', error);
    
    const errorDetails = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      path: '/dashboard'
    };

    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        await logUserActivity({
          userId: session.user.id,
          action: 'DASHBOARD_ERROR',
          metadata: errorDetails
        });
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    redirect('/auth/signin');
  }
}