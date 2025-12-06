-- Create finished_product_lots table
CREATE TABLE IF NOT EXISTS "public"."finished_product_lots" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "code" text NOT NULL,
    "intermediate_lot_id" uuid NOT NULL,
    "sku" text,
    "status" text DEFAULT 'active'::text CHECK (status IN ('active', 'released', 'blocked', 'quarantine', 'completed')),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone,
    "created_by" uuid,
    "tenant_id" uuid,
    CONSTRAINT "finished_product_lots_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "finished_product_lots_intermediate_lot_id_fkey" FOREIGN KEY ("intermediate_lot_id") REFERENCES "public"."intermediate_lots"("id"),
    CONSTRAINT "finished_product_lots_code_key" UNIQUE ("code")
);

-- Add RLS policies for finished_product_lots
ALTER TABLE "public"."finished_product_lots" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON "public"."finished_product_lots"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON "public"."finished_product_lots"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON "public"."finished_product_lots"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

-- Remove incorrect column from production_lots
ALTER TABLE "public"."production_lots" DROP COLUMN IF EXISTS "intermediate_lot_id";

-- Add finished_product_lot_id to samples
ALTER TABLE "public"."samples" ADD COLUMN IF NOT EXISTS "finished_product_lot_id" uuid;
ALTER TABLE "public"."samples" ADD CONSTRAINT "samples_finished_product_lot_id_fkey" FOREIGN KEY ("finished_product_lot_id") REFERENCES "public"."finished_product_lots"("id");
CREATE INDEX IF NOT EXISTS "samples_finished_product_lot_id_idx" ON "public"."samples" ("finished_product_lot_id");
