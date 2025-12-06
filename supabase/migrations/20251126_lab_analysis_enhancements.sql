-- ============================================================================
-- LAB ANALYSIS ENHANCEMENTS
-- Date: 2026-11-26
-- Phase: 3 - LIMS Sample Pipeline Enhancements
-- Description: Add missing fields to lab_analysis table for comprehensive test results tracking
-- ============================================================================

-- Add comment field to lab_analysis
ALTER TABLE lab_analysis 
ADD COLUMN IF NOT EXISTS comment text;

-- Add attachment support (JSON array of file paths/URLs)
ALTER TABLE lab_analysis 
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

-- Add performed_by field to track who actually performed the analysis
ALTER TABLE lab_analysis 
ADD COLUMN IF NOT EXISTS performed_by uuid REFERENCES profiles(id);

-- Add status field for tracking analysis lifecycle
ALTER TABLE lab_analysis 
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending';

-- Create index for faster sample result queries
CREATE INDEX IF NOT EXISTS idx_lab_analysis_sample 
ON lab_analysis(sample_id);

-- Create index for analyst queries
CREATE INDEX IF NOT EXISTS idx_lab_analysis_analyst 
ON lab_analysis(analyst_id) WHERE analyst_id IS NOT NULL;

-- Create index for performed_by queries
CREATE INDEX IF NOT EXISTS idx_lab_analysis_performed_by 
ON lab_analysis(performed_by) WHERE performed_by IS NOT NULL;

-- ============================================================================
-- CREATE VIEW FOR RESULTS WITH SPECIFICATIONS
-- ============================================================================

CREATE OR REPLACE VIEW sample_results_with_specs AS
SELECT 
  la.id,
  la.sample_id,
  la.parameter_id,
  la.result_value,
  la.unit,
  la.analyst_id,
  la.performed_by,
  la.analysis_date,
  la.validation_status,
  la.reviewer_id,
  la.comment,
  la.attachments,
  la.status,
  la.created_at,
  p.name as parameter_name,
  p.unit as parameter_unit,
  p.criticality as parameter_criticality,
  s.min_value as spec_min,
  s.max_value as spec_max,
  s.target_value as spec_target,
  sm.code as sample_code,
  sm.sample_type,
  sm.status as sample_status,
  prod.name as product_name,
  CASE 
    WHEN la.result_value IS NULL THEN 'not_tested'
    WHEN s.min_value IS NULL OR s.max_value IS NULL THEN 'no_spec'
    WHEN la.result_value < s.min_value THEN 'below_spec'
    WHEN la.result_value > s.max_value THEN 'above_spec'
    WHEN la.result_value BETWEEN s.min_value AND s.max_value THEN 'within_spec'
    ELSE 'no_spec'
  END as result_status
FROM lab_analysis la
LEFT JOIN parameters p ON la.parameter_id = p.id
LEFT JOIN samples sm ON la.sample_id = sm.id
LEFT JOIN products prod ON sm.product_id = prod.id
LEFT JOIN specifications s ON s.parameter_id = p.id AND s.product_id = sm.product_id;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'lab_analysis' 
AND column_name IN ('comment', 'attachments', 'performed_by', 'status')
ORDER BY column_name;

-- Verify indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'lab_analysis'
ORDER BY indexname;

-- Test view
SELECT * FROM sample_results_with_specs LIMIT 1;
