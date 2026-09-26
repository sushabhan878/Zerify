-- DropIndex
DROP INDEX "deliverable_revisions_deliverableId_version_idx";

-- AlterTable
ALTER TABLE "campaign_deliverables" ADD COLUMN     "allowLateSubmission" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allowedMimeTypes" TEXT[] DEFAULT ARRAY['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp']::TEXT[],
ADD COLUMN     "maxFileSizeMb" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "publicationDeadline" TIMESTAMP(3),
ADD COLUMN     "requiresPreApproval" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "requiresPublication" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "participant_deliverables" ADD COLUMN     "requirements" JSONB,
ADD COLUMN     "verificationStatus" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "deliverable_revisions" ADD COLUMN     "assetIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "caption" TEXT,
ADD COLUMN     "isFinal" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "publishedUrl" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "submissionType" TEXT NOT NULL DEFAULT 'FILE';

-- CreateTable
CREATE TABLE "deliverable_assets" (
    "id" TEXT NOT NULL,
    "deliverableId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "duration" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliverable_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliverable_events" (
    "id" TEXT NOT NULL,
    "deliverableId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "previousState" TEXT NOT NULL,
    "newState" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliverable_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deliverable_assets_publicId_key" ON "deliverable_assets"("publicId");

-- CreateIndex
CREATE INDEX "deliverable_assets_deliverableId_idx" ON "deliverable_assets"("deliverableId");

-- CreateIndex
CREATE INDEX "deliverable_events_deliverableId_createdAt_idx" ON "deliverable_events"("deliverableId", "createdAt");

-- Refuse ambiguous legacy versions instead of silently overwriting history.
-- The unique index below intentionally stops migration if duplicate versions exist.
UPDATE "participant_deliverables" d SET "version" = v.latest
FROM (SELECT "deliverableId", MAX(version) AS latest FROM "deliverable_revisions" GROUP BY "deliverableId") v
WHERE d.id = v."deliverableId";

-- Preserve the current legacy review decision on its corresponding version.
UPDATE "deliverable_revisions" r SET
  status = COALESCE(d."reviewStatus", r.status),
  "reviewComments" = d."reviewComments", "reviewedAt" = d."reviewedAt", "reviewedBy" = d."reviewedBy"
FROM "participant_deliverables" d
WHERE r."deliverableId" = d.id AND r.version = d.version;

-- Legacy rows retain conservative publication-required defaults.
UPDATE "participant_deliverables" SET "verificationStatus" = CASE
  WHEN status = 'VERIFIED' THEN 'VERIFIED_MANUALLY'
  WHEN "publishedUrl" IS NOT NULL THEN 'MANUAL_REVIEW_REQUIRED'
  ELSE NULL END;

-- CreateIndex
CREATE UNIQUE INDEX "deliverable_revisions_deliverableId_version_key" ON "deliverable_revisions"("deliverableId", "version");

-- AddForeignKey
ALTER TABLE "deliverable_assets" ADD CONSTRAINT "deliverable_assets_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "participant_deliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverable_events" ADD CONSTRAINT "deliverable_events_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "participant_deliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

