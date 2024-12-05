// src/lib/logging.ts
import { prisma } from './prisma';

export type ActivityType =
  | 'LOGIN'
  | 'SIGNUP'
  | 'TASK_CREATE'
  | 'TASK_FETCH'
  | 'TASK_UPDATE'
  | 'TASK_DELETE'
  | 'STATUS_CHANGE'
  | 'PRIORITY_CHANGE'
  | 'PASSWORD_CHANGE'
  | 'PROJECT_CREATE'
  | 'PROJECT_UPDATE'
  | 'PROJECT_DELETE'
  | 'PROJECT_VIEW'
  | 'PROJECTS_VIEW'
  | 'PROJECT_TASKS_VIEW'
  | 'PROJECT_TASK_CREATE'
  | 'DASHBOARD_ACCESS'
  | 'DASHBOARD_ERROR';

type TaskEventType = 
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'DESCRIPTION_UPDATED'
  | 'DUE_DATE_CHANGED'
  | 'TASK_CREATED'
  | 'TASK_DELETED'
  | 'PROJECT_CHANGED'
  | 'MOVED_TO_PROJECT';

type ProjectEventType =
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_DELETED'
  | 'PROJECT_ARCHIVED'
  | 'PROJECT_RESTORED'
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED';

interface LogActivityParams {
  userId: string | undefined;
  action: ActivityType;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  projectId?: string;
}

interface LogTaskEventParams {
  taskId: string;
  type: TaskEventType;
  oldValue?: string | null;
  newValue?: string | null;
  projectId?: string;
  userId?: string;
}

interface LogProjectEventParams {
  projectId: string;
  type: ProjectEventType;
  userId: string;
  metadata?: Record<string, any>;
}

export async function logUserActivity({
  userId,
  action,
  metadata = {},
  ipAddress = 'IP Unavailable',
  userAgent = 'User-Agent Unavailable',
  projectId,
}: LogActivityParams) {
  if (!userId) {
    console.warn('No user ID provided for activity logging');
    return;
  }

  const enrichedMetadata = {
    ...metadata,
    timestamp: new Date().toISOString(),
    projectId,
  };

  try {
    await prisma.userActivity.create({
      data: {
        userId,
        action,
        metadata: enrichedMetadata,
        ipAddress,
        userAgent,
      },
    });
    console.log(`User activity logged successfully: ${action}`);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function logTaskEvent({
  taskId,
  type,
  oldValue,
  newValue,
  projectId,
  userId,
}: LogTaskEventParams) {
  try {
    const eventData = {
      taskId,
      type,
      oldValue: oldValue?.toString() ?? null,
      newValue: newValue?.toString() ?? null,
    };

    await prisma.taskEvent.create({
      data: eventData,
    });

    // Log corresponding user activity if userId is provided
    if (userId) {
      await logUserActivity({
        userId,
        action: 'TASK_UPDATE',
        metadata: {
          taskId,
          eventType: type,
          oldValue,
          newValue,
          projectId,
        },
      });
    }

    console.log(`Task event logged successfully: ${type}`);
  } catch (error) {
    console.error('Failed to log task event:', error);
  }
}

export async function logProjectEvent({
  projectId,
  type,
  userId,
  metadata = {},
}: LogProjectEventParams) {
  try {
    // Log the project-specific event
    await prisma.userActivity.create({
      data: {
        userId,
        action: `PROJECT_${type}` as ActivityType,
        metadata: {
          ...metadata,
          projectId,
          timestamp: new Date().toISOString(),
          eventType: type,
        },
      },
    });

    console.log(`Project event logged successfully: ${type}`);
  } catch (error) {
    console.error('Failed to log project event:', error);
  }
}

// Utility function to format activity for display
// Update the formatActivityMessage function
export function formatActivityMessage(
  action: ActivityType,
  metadata?: Record<string, any>
): string {
  const messages: Record<ActivityType, string> = {
    LOGIN: 'Logged in',
    SIGNUP: 'Signed up',
    TASK_CREATE: 'Created a new task',
    TASK_FETCH: 'Viewed tasks',
    TASK_UPDATE: 'Updated a task',
    TASK_DELETE: 'Deleted a task',
    STATUS_CHANGE: 'Changed task status',
    PRIORITY_CHANGE: 'Changed task priority',
    PASSWORD_CHANGE: 'Changed password',
    PROJECT_CREATE: 'Created a new project',
    PROJECT_UPDATE: 'Updated project details',
    PROJECT_DELETE: 'Deleted a project',
    PROJECT_VIEW: 'Viewed project details',
    PROJECTS_VIEW: 'Viewed projects list',
    PROJECT_TASKS_VIEW: 'Viewed project tasks',
    PROJECT_TASK_CREATE: 'Created a task in project',
    DASHBOARD_ACCESS: 'Accessed dashboard',
    DASHBOARD_ERROR: 'Encountered an error in dashboard'
  };

  let message = messages[action] || action.toLowerCase().replace(/_/g, ' ');

  if (metadata) {
    if (metadata.projectName) {
      message += ` in ${metadata.projectName}`;
    }
    if (metadata.taskTitle) {
      message += `: ${metadata.taskTitle}`;
    }
  }

  return message;
}