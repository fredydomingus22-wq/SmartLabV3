-- ============================================================================
-- FOREIGN KEY VALIDATION
-- Date: 2025-11-26
-- Phase: 2 - Data Model Cleanup
-- Description: Add missing foreign key constraints for referential integrity
-- ============================================================================

-- ============================================================================
-- STEP 1: Add Missing Foreign Keys to Samples Table
-- ============================================================================

-- Samples → Profiles (assigned_to)
ALTER TABLE samples ADD CONSTRAINT samples_assigned_to_fkey
FOREIGN KEY (assigned_to) REFERENCES profiles(id)
ON DELETE SET NULL;

-- Samples → Profiles (created_by) - if not already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'samples_created_by_fkey'
    ) THEN
        ALTER TABLE samples ADD CONSTRAINT samples_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES auth.users(id);
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Add Missing Foreign Keys to Production Tables
-- ============================================================================

-- Production Lots → Products
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'production_lots_product_id_fkey'
    ) THEN
        ALTER TABLE production_lots ADD CONSTRAINT production_lots_product_id_fkey
        FOREIGN KEY (product_id) REFERENCES products(id);
    END IF;
END $$;

-- Production Lots → Profiles (created_by)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'production_lots_created_by_fkey'
    ) THEN
        ALTER TABLE production_lots ADD CONSTRAINT production_lots_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES auth.users(id);
    END IF;
END $$;

-- Intermediate Lots → Products
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'intermediate_lots_product_id_fkey'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'intermediate_lots' AND column_name = 'product_id'
        ) THEN
            ALTER TABLE intermediate_lots ADD CONSTRAINT intermediate_lots_product_id_fkey
            FOREIGN KEY (product_id) REFERENCES products(id);
        END IF;
    END IF;
END $$;

-- Finished Lots → Products
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'finished_lots_product_id_fkey'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'finished_lots' AND column_name = 'product_id'
        ) THEN
            ALTER TABLE finished_lots ADD CONSTRAINT finished_lots_product_id_fkey
            FOREIGN KEY (product_id) REFERENCES products(id);
        END IF;
    END IF;
END $$;

-- ============================================================================
-- STEP 3: Add Missing Foreign Keys to QMS Tables
-- ============================================================================

-- Non-Conformities → Products
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'nc_product_id_fkey'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'non_conformities' AND column_name = 'product_id'
        ) THEN
            ALTER TABLE non_conformities ADD CONSTRAINT nc_product_id_fkey
            FOREIGN KEY (product_id) REFERENCES products(id)
            ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- NC Actions → NC (verify exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'nc_actions_nc_id_fkey'
    ) THEN
        ALTER TABLE nc_actions ADD CONSTRAINT nc_actions_nc_id_fkey
        FOREIGN KEY (nc_id) REFERENCES non_conformities(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- NC Root Causes → NC
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'nc_root_causes_nc_id_fkey'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'nc_root_causes' AND column_name = 'nc_id'
        ) THEN
            ALTER TABLE nc_root_causes ADD CONSTRAINT nc_root_causes_nc_id_fkey
            FOREIGN KEY (nc_id) REFERENCES non_conformities(id)
            ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- STEP 4: Add Missing Foreign Keys to Specifications
-- ============================================================================

-- Specifications → Products
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'specifications_product_id_fkey'
    ) THEN
        ALTER TABLE specifications ADD CONSTRAINT specifications_product_id_fkey
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Specifications → Parameters
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'specifications_parameter_id_fkey'
    ) THEN
        ALTER TABLE specifications ADD CONSTRAINT specifications_parameter_id_fkey
        FOREIGN KEY (parameter_id) REFERENCES parameters(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Specifications → Profiles (approved_by)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'specifications_approved_by_fkey'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'specifications' AND column_name = 'approved_by'
        ) THEN
            ALTER TABLE specifications ADD CONSTRAINT specifications_approved_by_fkey
            FOREIGN KEY (approved_by) REFERENCES profiles(id)
            ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- STEP 5: Add Missing Foreign Keys to Food Safety Tables
-- ============================================================================

-- Food Safety PCC → Products
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'food_safety_pcc_product_id_fkey'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'food_safety_pcc' AND column_name = 'product_id'
        ) THEN
            ALTER TABLE food_safety_pcc ADD CONSTRAINT food_safety_pcc_product_id_fkey
            FOREIGN KEY (product_id) REFERENCES products(id)
            ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- STEP 6: Add Missing Foreign Keys to Equipment & Resources
-- ============================================================================

-- Equipment → Factories
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'equipment_factory_id_fkey'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'equipment' AND column_name = 'factory_id'
        ) THEN
            ALTER TABLE equipment ADD CONSTRAINT equipment_factory_id_fkey
            FOREIGN KEY (factory_id) REFERENCES factories(id)
            ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Reagent Batches → Reagents
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'reagent_batches_reagent_id_fkey'
    ) THEN
        ALTER TABLE reagent_batches ADD CONSTRAINT reagent_batches_reagent_id_fkey
        FOREIGN KEY (reagent_id) REFERENCES reagents(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- STEP 7: Add Missing Foreign Keys to Form System
-- ============================================================================

-- Form Fields → Form Templates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'form_fields_template_id_fkey'
    ) THEN
        ALTER TABLE form_fields ADD CONSTRAINT form_fields_template_id_fkey
        FOREIGN KEY (template_id) REFERENCES form_templates(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Form Submissions → Form Templates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'form_submissions_template_id_fkey'
    ) THEN
        ALTER TABLE form_submissions ADD CONSTRAINT form_submissions_template_id_fkey
        FOREIGN KEY (template_id) REFERENCES form_templates(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- List all foreign key constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- Count foreign keys per table
SELECT
    table_name,
    COUNT(*) as fk_count
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
AND table_schema = 'public'
GROUP BY table_name
ORDER BY fk_count DESC, table_name;

-- Test referential integrity (should fail if FK works)
-- INSERT INTO samples (code, sample_type, status, assigned_to) 
-- VALUES ('TEST', 'finished_product', 'pending', '00000000-0000-0000-0000-000000000000');
-- Expected: ERROR: insert or update violates foreign key constraint "samples_assigned_to_fkey"
