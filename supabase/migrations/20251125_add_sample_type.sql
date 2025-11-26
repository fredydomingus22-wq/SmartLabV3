-- Add sample_type column to samples table
-- This allows categorizing samples as environmental swabs, finished products, intermediate products, raw materials, etc.

ALTER TABLE samples
ADD COLUMN IF NOT EXISTS sample_type TEXT DEFAULT 'finished_product'
CHECK (sample_type IN (
    'environmental_swab',
    'finished_product', 
    'intermediate_product',
    'raw_material',
    'water_sample',
    'equipment_swab',
    'personnel_swab',
    'air_sample',
    'other'
));

-- Add index for filtering by sample type
CREATE INDEX IF NOT EXISTS idx_samples_sample_type ON samples(sample_type);

-- Add comment
COMMENT ON COLUMN samples.sample_type IS 'Type of sample: environmental_swab, finished_product, intermediate_product, raw_material, water_sample, equipment_swab, personnel_swab, air_sample, other';
