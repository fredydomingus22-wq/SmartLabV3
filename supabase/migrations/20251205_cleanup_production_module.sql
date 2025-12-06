-- Production Module Cleanup Migration
-- Removes dead/unused tables and redundant columns
-- Date: 2025-12-05

-- ============================================================================
-- 1. DROP DEAD TABLES (Never used in application)
-- ============================================================================

-- line_samples and line_analysis were created but never integrated
DROP TABLE IF EXISTS public.line_analysis CASCADE;
DROP TABLE IF EXISTS public.line_samples CASCADE;

-- finished_lots was deprecated in favor of finished_product_lots
DROP TABLE IF EXISTS public.finished_lots CASCADE;

-- intermediate_tanks was a confusing rename, intermediate_lots is the correct one
DROP TABLE IF EXISTS public.intermediate_tanks CASCADE;

-- ============================================================================
-- 2. REMOVE REDUNDANT COLUMNS FROM production_lots
-- ============================================================================

-- Keep production_line_id (FK), remove text field
ALTER TABLE public.production_lots DROP COLUMN IF EXISTS production_line;

-- Keep shift_id (FK), remove text field  
ALTER TABLE public.production_lots DROP COLUMN IF EXISTS shift;

-- Remove duplicate line_id column
ALTER TABLE public.production_lots DROP COLUMN IF EXISTS line_id;

-- ============================================================================
-- 3. CLEANUP: Add comments documenting the correct structure
-- ============================================================================

COMMENT ON TABLE public.production_lots IS 'Parent production lots (Lote Pai) - main production orders';
COMMENT ON TABLE public.intermediate_lots IS 'Intermediate lots (Lote Intermédio) - tank batches during production';
COMMENT ON TABLE public.finished_product_lots IS 'Finished product lots (Lote Final/PF) - final packaged products';
COMMENT ON TABLE public.mixing_tanks IS 'Equipment registry - physical mixing tanks in the factory';
COMMENT ON TABLE public.samples IS 'Unified sample collection - all sample types (tank, line, finished, water, etc.)';
COMMENT ON TABLE public.lab_analysis IS 'Lab analysis results - measurements per sample per parameter';
