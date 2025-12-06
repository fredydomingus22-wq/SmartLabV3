-- Migration: Add missing columns to samples table
-- Date: 2025-11-28
-- Description: Add collection_point, collected_by, notes, and raw_material_lot_id columns

-- Add collection_point
ALTER TABLE samples
ADD COLUMN IF NOT EXISTS collection_point TEXT;

-- Add collected_by (FK to profiles)
ALTER TABLE samples
ADD COLUMN IF NOT EXISTS collected_by UUID REFERENCES profiles(id);

-- Add notes
ALTER TABLE samples
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add raw_material_lot_id (FK to raw_material_lots if table exists)
ALTER TABLE samples
ADD COLUMN IF NOT EXISTS raw_material_lot_id UUID;

-- Create indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_samples_collected_by ON samples(collected_by);
CREATE INDEX IF NOT EXISTS idx_samples_raw_material_lot ON samples(raw_material_lot_id);

-- Add comment
COMMENT ON COLUMN samples.collection_point IS 'Local de colheita da amostra (ex: Tanque 5, Linha 2)';
COMMENT ON COLUMN samples.collected_by IS 'Técnico que recolheu a amostra';
COMMENT ON COLUMN samples.notes IS 'Observações adicionais sobre a amostra';
