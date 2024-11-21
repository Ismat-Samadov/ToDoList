// src/lib/logging.ts
import { prisma } from './prisma'

export async function logUserActivity(userId: string, action: string, metadata?: any) {
  return prisma.userActivity.create({
    data: {
      userId,
      action,
      metadata,
    },
  })
}