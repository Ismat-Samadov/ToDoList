// src/lib/logging.ts
import { prisma } from './prisma'

type ActivityType = 
  | 'LOGIN' 
  | 'SIGNUP'
  | 'TASK_CREATE'
  | 'TASK_UPDATE'
  | 'TASK_DELETE'
  | 'STATUS_CHANGE'
  | 'PRIORITY_CHANGE'
  | 'PASSWORD_CHANGE';

interface LogOptions {
  userId: string;
  action: ActivityType;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
}

export async function logUserActivity({
  userId,
  action,
  metadata = {},
  ip,
  userAgent,
  sessionId
}: LogOptions) {
  const enrichedMetadata = {
    ...metadata,
    ip,
    userAgent,
    sessionId,
    timestamp: new Date().toISOString()
  };

  return prisma.userActivity.create({
    data: {
      userId,
      action,
      metadata: enrichedMetadata,
    },
  });
}