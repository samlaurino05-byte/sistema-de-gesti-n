-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_organizationId_slug_key" ON "Invoice"("organizationId", "slug");

