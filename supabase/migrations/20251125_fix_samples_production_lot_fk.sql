-- Fix samples table foreign keys
-- Add production_lot_id to properly link production lots for finished products

ALTER TABLE samples
ADD COLUMN IF NOT EXISTS production_lot_id UUID REFERENCES production_lots(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_samples_production_lot ON samples(production_lot_id);

-- Add comment
COMMENT ON COLUMN samples.production_lot_id IS 'Link to production lot for finished products';

-- Note: Keep intermediate_lot_id and finished_lot_id for backward compatibility
-- But production_lot_id should be used for new finished product samples
