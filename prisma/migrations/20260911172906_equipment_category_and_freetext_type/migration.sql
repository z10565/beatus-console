-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('finished_good', 'raw_material');

-- Convert Equipment.type from the fixed EquipmentType enum to free text,
-- and add a category column distinguishing finished goods from raw materials.
ALTER TABLE "Equipment" ADD COLUMN "category" "EquipmentCategory" NOT NULL DEFAULT 'finished_good';
ALTER TABLE "Equipment" ALTER COLUMN "type" TYPE TEXT USING "type"::text;

-- Rename existing enum values to their proper display names
UPDATE "Equipment" SET "type" = 'Mini Unit' WHERE "type" = 'mini';
UPDATE "Equipment" SET "type" = 'Small Unit' WHERE "type" = 'small';
UPDATE "Equipment" SET "type" = 'Large Unit' WHERE "type" = 'large';

DROP TYPE "EquipmentType";

-- CreateIndex
CREATE INDEX "Equipment_category_idx" ON "Equipment"("category");
