-- AlterTable
ALTER TABLE "ball_events" ADD COLUMN "fielderId" TEXT;

-- AddForeignKey
ALTER TABLE "ball_events" ADD CONSTRAINT "ball_events_fielderId_fkey" FOREIGN KEY ("fielderId") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;
