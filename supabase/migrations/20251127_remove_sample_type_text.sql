-- Migration: Remove redundant sample_type TEXT column
-- Description: Removes sample_type TEXT column from samples table since we now use sample_type_id FK

-- 1. Ensure all samples have sample_type_id populated (safety check)
UPDATE samples s
SET sample_type_id = st.id
FROM sample_types st
WHERE s.sample_type = st.code
AND s.sample_type_id IS NULL;

-- 2. Drop the TEXT column and its dependencies
DROP INDEX IF EXISTS idx_samples_sample_type;
ALTER TABLE samples DROP COLUMN IF EXISTS sample_type;

-- 3. Add index on sample_type_id for performance
CREATE INDEX IF NOT EXISTS idx_samples_sample_type_id ON samples(sample_type_id);
