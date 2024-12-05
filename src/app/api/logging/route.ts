// src/app/api/logging/route.ts
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth.config';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

    const body = await request.json();
    
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action: body.action,
        metadata: body.metadata || {},
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error logging activity:', error);
    return new NextResponse('Error logging activity', { status: 500 });
  }
}