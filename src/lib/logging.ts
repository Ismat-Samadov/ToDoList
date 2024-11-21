import { prisma } from './prisma';

type ActivityType =
  | 'LOGIN'
  | 'SIGNUP'
  | 'TASK_CREATE'
  | 'TASK_UPDATE'
  | 'TASK_DELETE'
  | 'STATUS_CHANGE'
  | 'PRIORITY_CHANGE'
  | 'PASSWORD_CHANGE';

export async function logUserActivity({
  userId,
  action,
  metadata = {},
  ipAddress,
  userAgent,
  sessionId,
}: {
  userId: string | undefined;
  action: ActivityType;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}) {
  if (!userId) {
    console.warn('No user ID provided for activity logging');
    return;
  }

  const enrichedMetadata = {
    ...metadata,
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.userActivity.create({
      data: {
        userId,
        action,
        metadata: enrichedMetadata,
        ipAddress,
        userAgent,
        sessionId,
      },
    });
    console.log('User activity logged successfully');
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
