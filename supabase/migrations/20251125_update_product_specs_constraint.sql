-- Update product_specs constraint to allow multiple specs per parameter (differentiated by test_level)
-- Migration: 20251125_update_product_specs_constraint.sql

-- 1. Drop existing unique constraint
ALTER TABLE product_specs 
DROP CONSTRAINT IF EXISTS product_specs_product_id_parameter_id_key;

-- 2. Add new unique constraint including test_level
-- We use COALESCE to treat NULL test_level as a distinct value 'none' for uniqueness purposes
-- This ensures we can't have multiple specs with NULL test_level for the same parameter
CREATE UNIQUE INDEX idx_product_specs_unique_level 
ON product_specs (product_id, parameter_id, COALESCE(test_level, 'none'));

-- Note: We use a unique index with COALESCE because standard UNIQUE constraint allows multiple NULLs
