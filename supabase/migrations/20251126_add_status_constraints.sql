-- ============================================================================
-- STATUS CONSTRAINTS STANDARDIZATION
-- Date: 2025-11-26
-- Phase: 2 - Data Model Cleanup
-- Description: Add CHECK constraints to all status fields for data integrity
-- ============================================================================

-- ============================================================================
-- STEP 1: Production/Lot Status Constraints
-- ============================================================================

-- Production Lots: draft → active → on_hold/completed → cancelled
ALTER TABLE production_lots ADD CONSTRAINT production_lots_status_check
CHECK (status IN ('draft', 'active', 'on_hold', 'completed', 'cancelled'));

-- Intermediate Lots
ALTER TABLE intermediate_lots ADD CONSTRAINT intermediate_lots_status_check
CHECK (status IN ('draft', 'active', 'on_hold', 'completed', 'cancelled'));

-- Finished Lots
ALTER TABLE finished_lots ADD CONSTRAINT finished_lots_status_check
CHECK (status IN ('draft', 'active', 'on_hold', 'completed', 'cancelled'));

-- ============================================================================
-- STEP 2: Sample Workflow Status
-- ============================================================================

-- Samples: pending → in_analysis → under_review → approved/rejected
ALTER TABLE samples ADD CONSTRAINT samples_status_check
CHECK (status IN ('pending', 'in_analysis', 'under_review', 'approved', 'rejected'));

-- ============================================================================
-- STEP 3: NC Workflow Status
-- ============================================================================

-- Non-Conformities: draft → open → investigating → pending_approval → approved/rejected → closed
ALTER TABLE non_conformities ADD CONSTRAINT nc_status_check
CHECK (status IN ('draft', 'open', 'investigating', 'pending_approval', 'approved', 'rejected', 'closed'));

-- NC Actions: not_started → in_progress → completed/cancelled → overdue
ALTER TABLE nc_actions ADD CONSTRAINT nc_actions_status_check
CHECK (status IN ('not_started', 'in_progress', 'completed', 'cancelled', 'overdue'));

-- NC Root Causes
ALTER TABLE nc_root_causes ADD CONSTRAINT nc_root_causes_status_check
CHECK (status IN ('draft', 'identified', 'verified', 'resolved'));

-- ============================================================================
-- STEP 4: Food Safety Status
-- ============================================================================

-- Food Safety PCC
ALTER TABLE food_safety_pcc ADD CONSTRAINT food_safety_pcc_status_check
CHECK (status IN ('active', 'monitoring', 'deviation', 'corrected', 'inactive'));

-- Food Safety OPRP
ALTER TABLE food_safety_oprp ADD CONSTRAINT food_safety_oprp_status_check
CHECK (status IN ('active', 'monitoring', 'inactive'));

-- Food Safety PRP
ALTER TABLE food_safety_prp ADD CONSTRAINT food_safety_prp_status_check
CHECK (status IN ('active', 'inactive'));

-- ============================================================================
-- STEP 5: Training & Audit Status
-- ============================================================================

-- Trainings: scheduled → in_progress → completed → cancelled
ALTER TABLE trainings ADD CONSTRAINT trainings_status_check
CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'));

-- Audits: planned → pending → in_progress → completed → cancelled
ALTER TABLE audits ADD CONSTRAINT audits_status_check
CHECK (status IN ('planned', 'pending', 'in_progress', 'completed', 'cancelled'));

-- ============================================================================
-- STEP 6: Equipment & Resources Status
-- ============================================================================

-- Equipment: active → maintenance → out_of_service → retired
ALTER TABLE equipment ADD CONSTRAINT equipment_status_check
CHECK (status IN ('active', 'maintenance', 'calibration_due', 'out_of_service', 'retired'));

-- Reagents
ALTER TABLE reagents ADD CONSTRAINT reagents_status_check
CHECK (status IN ('available', 'low_stock', 'expired', 'depleted'));

-- ============================================================================
-- STEP 7: Supplier Status
-- ============================================================================

-- Add status column if doesn't exist
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add constraint
ALTER TABLE suppliers ADD CONSTRAINT suppliers_status_check
CHECK (status IN ('active', 'inactive', 'suspended', 'qualified', 'under_review'));

-- ============================================================================
-- STEP 8: CIP Records Status
-- ============================================================================

-- CIP Records
ALTER TABLE cip_records ADD CONSTRAINT cip_records_status_check
CHECK (status IN ('pending', 'in_progress', 'completed', 'failed'));

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count constraints added
SELECT 
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.constraint_type = 'CHECK'
AND tc.constraint_name LIKE '%status%'
ORDER BY tc.table_name;

-- Test a constraint (should fail)
-- INSERT INTO samples (code, sample_type, status) VALUES ('TEST', 'finished_product', 'invalid_status');
-- Expected: ERROR: new row violates check constraint "samples_status_check"
