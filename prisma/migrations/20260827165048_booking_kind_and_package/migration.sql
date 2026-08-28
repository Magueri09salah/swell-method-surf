-- CreateEnum
CREATE TYPE "BookingKind" AS ENUM ('SESSION', 'PACKAGE');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "bookingType" "BookingKind" NOT NULL DEFAULT 'SESSION',
ADD COLUMN     "packageId" TEXT;

-- CreateIndex
CREATE INDEX "bookings_packageId_idx" ON "bookings"("packageId");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
