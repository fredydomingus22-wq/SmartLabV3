-- Migration: Add FK constraints to production_lots
-- Date: 2025-11-25
-- Purpose: Replace TEXT fields with proper UUID FKs for production_line and shift

-- ============================================================================
-- 1. ADD NEW UUID COLUMNS
-- ============================================================================

ALTER TABLE public.production_lots
    ADD COLUMN IF NOT EXISTS production_line_id UUID REFERENCES public.production_lines(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL;

-- ============================================================================
-- 2. MIGRATE EXISTING DATA (if possible)
-- ============================================================================

-- Note: This migration keeps both TEXT and UUID columns for backward compatibility
-- In a future migration, after data migration is complete, the TEXT columns can be removed

-- ============================================================================
-- 3. CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_production_lots_line_id 
    ON public.production_lots(production_line_id);

CREATE INDEX IF NOT EXISTS idx_production_lots_shift_id 
    ON public.production_lots(shift_id);

-- ============================================================================
-- 4. ADD COMMENTS
-- ============================================================================

COMMENT ON COLUMN public.production_lots.production_line_id IS 
    'FK to production_lines table (preferred over production_line TEXT field)';

COMMENT ON COLUMN public.production_lots.shift_id IS 
    'FK to shifts table (preferred over shift TEXT field)';
