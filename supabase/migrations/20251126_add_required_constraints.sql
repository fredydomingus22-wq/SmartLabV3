-- ============================================================================
-- REQUIRED FIELD CONSTRAINTS
-- Date: 2025-11-26
-- Phase: 2 - Data Model Cleanup
-- Description: Add NOT NULL and UNIQUE constraints to required fields
-- ============================================================================

-- ============================================================================
-- STEP 1: Validate Data Before Adding Constraints
-- ============================================================================

-- Update NULL values to defaults where needed
-- Production lots should have product_id
UPDATE production_lots SET product_id = (SELECT id FROM products LIMIT 1) WHERE product_id IS NULL;

-- Samples should have sample_type
UPDATE samples SET sample_type = 'other' WHERE sample_type IS NULL;

-- NC should have type
UPDATE non_conformities SET type = 'quality' WHERE type IS NULL;

-- ============================================================================
-- STEP 2: Add NOT NULL Constraints to Required Fields
-- ============================================================================

-- Production Lots
ALTER TABLE production_lots ALTER COLUMN product_id SET NOT NULL;
ALTER TABLE production_lots ALTER COLUMN lot_code SET NOT NULL;
ALTER TABLE production_lots ALTER COLUMN status SET NOT NULL;

-- Intermediate Lots
ALTER TABLE intermediate_lots ALTER COLUMN status SET NOT NULL;

-- Finished Lots
ALTER TABLE finished_lots ALTER COLUMN status SET NOT NULL;

-- Samples
ALTER TABLE samples ALTER COLUMN sample_type SET NOT NULL;
ALTER TABLE samples ALTER COLUMN status SET NOT NULL;
ALTER TABLE samples ALTER COLUMN collected_at SET NOT NULL;

-- Non-Conformities
ALTER TABLE non_conformities ALTER COLUMN type SET NOT NULL;
ALTER TABLE non_conformities ALTER COLUMN status SET NOT NULL;
ALTER TABLE non_conformities ALTER COLUMN opened_at SET NOT NULL;

-- Specifications
ALTER TABLE specifications ALTER COLUMN product_id SET NOT NULL;

-- Parameters
ALTER TABLE parameters ALTER COLUMN name SET NOT NULL;

-- Products  
ALTER TABLE products ALTER COLUMN name SET NOT NULL;

-- ============================================================================
-- STEP 3: Add UNIQUE Constraints to Identifier Fields
-- ============================================================================

-- Production Lots - lot_code must be unique
ALTER TABLE production_lots ADD CONSTRAINT production_lots_lot_code_unique 
UNIQUE (lot_code);

-- Samples - code must be unique
ALTER TABLE samples ADD CONSTRAINT samples_code_unique 
UNIQUE (code);

-- Non-Conformities - nc_number must be unique
ALTER TABLE non_conformities ADD CONSTRAINT nc_number_unique 
UNIQUE (nc_number);

-- Products - code should be unique
ALTER TABLE products ADD CONSTRAINT products_code_unique 
UNIQUE (code);

-- Raw Materials - code should be unique
ALTER TABLE raw_materials ADD CONSTRAINT raw_materials_code_unique 
UNIQUE (code);

-- Equipment - code should be unique
ALTER TABLE equipment ADD CONSTRAINT equipment_code_unique 
UNIQUE (code);

-- Reagents - code should be unique (if column exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reagents' AND column_name = 'code'
    ) THEN
        ALTER TABLE reagents ADD CONSTRAINT reagents_code_unique UNIQUE (code);
    END IF;
END $$;

-- ============================================================================
-- STEP 4: Add Composite UNIQUE Constraints
-- ============================================================================

-- Prevent duplicate parameter-product combinations
ALTER TABLE specifications ADD CONSTRAINT specifications_product_parameter_unique
UNIQUE (product_id, parameter_id);

-- Prevent duplicate form field names within same template
ALTER TABLE form_fields ADD CONSTRAINT form_fields_template_name_unique
UNIQUE (template_id, field_name);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check NOT NULL constraints
SELECT 
    table_name,
    column_name,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND is_nullable = 'NO'
AND column_name IN ('product_id', 'sample_type', 'type', 'lot_code', 'status')
ORDER BY table_name, column_name;

-- Check UNIQUE constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- Test UNIQUE constraint (should fail)
-- INSERT INTO production_lots (lot_code, product_id, status) 
-- VALUES ((SELECT lot_code FROM production_lots LIMIT 1), '...', 'draft');
-- Expected: ERROR: duplicate key value violates unique constraint "production_lots_lot_code_unique"
