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
 userId: string | undefined;
 action: ActivityType;
 metadata?: Record<string, any>;
}

export async function logUserActivity({
 userId,
 action,
 metadata = {}
}: LogOptions) {
 if (!userId) {
   console.warn('No user ID provided for activity logging');
   return;
 }

 const enrichedMetadata = {
   ...metadata,
   timestamp: new Date().toISOString()
 };

 try {
   return await prisma.userActivity.create({
     data: {
       userId,
       action,
       metadata: enrichedMetadata,
     },
   });
 } catch (error) {
   console.error('Failed to log activity:', error);
   // Don't throw - logging should not break main functionality
 }
}