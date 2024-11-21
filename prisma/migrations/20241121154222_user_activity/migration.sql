-- AlterTable
ALTER TABLE "UserActivity" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "userAgent" TEXT,
ALTER COLUMN "metadata" SET DEFAULT '{}';
