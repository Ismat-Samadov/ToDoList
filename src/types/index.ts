// src/types/index.ts
import { Task, Project } from '@prisma/client';

export interface ProjectWithTasks extends Project {
  tasks: Task[];
  _count?: {
    tasks: number;
  };
}

export interface TaskWithProject extends Task {
  project: Project;
}

export type TaskFormData = {
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  projectId: string;
};

export type ProjectFormData = {
  name: string;
  description?: string;
};

export type TaskFilter = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface UserActivity {
  userId: string;
  action: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}