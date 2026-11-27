-- GCC countries (release 1: additive and safe for live data).
--
-- Every existing row is the UAE / AED, so each new column is added empty,
-- filled from what is already there, and only then made required.
-- Nothing is renamed or dropped, and no existing value changes.

-- 1. Countries. Reference data for all six; only the UAE is switched on.
CREATE TABLE "countries" (
    "id" UUID NOT NULL,
    "code" VARCHAR(2) NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "dialCode" VARCHAR(4) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");

INSERT INTO "countries" ("id", "code", "nameEn", "nameAr", "dialCode", "currency", "isActive", "updatedAt") VALUES
  (gen_random_uuid(), 'AE', 'United Arab Emirates', 'الإمارات العربية المتحدة', '971', 'AED', true,  CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'SA', 'Saudi Arabia',         'المملكة العربية السعودية', '966', 'SAR', false, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'QA', 'Qatar',                'قطر',                      '974', 'QAR', false, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'KW', 'Kuwait',               'الكويت',                   '965', 'KWD', false, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'BH', 'Bahrain',              'البحرين',                  '973', 'BHD', false, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'OM', 'Oman',                 'سلطنة عُمان',              '968', 'OMR', false, CURRENT_TIMESTAMP);

-- 2. Regions belong to a country. All existing regions are UAE emirates.
ALTER TABLE "emirates" ADD COLUMN "countryId" UUID;
UPDATE "emirates" SET "countryId" = (SELECT "id" FROM "countries" WHERE "code" = 'AE');
ALTER TABLE "emirates" ALTER COLUMN "countryId" SET NOT NULL;

CREATE INDEX "emirates_countryId_idx" ON "emirates"("countryId");
ALTER TABLE "emirates"
  ADD CONSTRAINT "emirates_countryId_fkey"
  FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3. Listings keep their price in the seller's currency. Existing ads are AED,
--    so their price is exactly what "priceAed" already holds.
ALTER TABLE "listings"
  ADD COLUMN "countryCode" VARCHAR(2) NOT NULL DEFAULT 'AE',
  ADD COLUMN "currency" VARCHAR(3) NOT NULL DEFAULT 'AED',
  ADD COLUMN "price" INTEGER;
UPDATE "listings" SET "price" = "priceAed";
ALTER TABLE "listings" ALTER COLUMN "price" SET NOT NULL;

CREATE INDEX "listings_countryCode_status_idx" ON "listings"("countryCode", "status");

-- 4. TRANSITIONAL SAFEGUARD (remove in a later cleanup migration).
--    Between applying this migration and deploying the new code, the old code
--    keeps creating ads without a "price". This trigger fills it from
--    "priceAed" (AED, as the old code assumes) so those inserts still succeed.
CREATE FUNCTION "listings_default_price"() RETURNS trigger AS $$
BEGIN
  IF NEW."price" IS NULL THEN
    NEW."price" := NEW."priceAed";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "listings_default_price_trg"
  BEFORE INSERT ON "listings"
  FOR EACH ROW EXECUTE FUNCTION "listings_default_price"();
