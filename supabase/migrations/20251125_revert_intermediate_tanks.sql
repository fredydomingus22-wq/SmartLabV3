-- Migration: Revert intermediate_tanks back to intermediate_lots
-- Date: 2025-11-25
-- Purpose: Fix schema inconsistency where create page references intermediate_lots 
--          but migration renamed it to intermediate_tanks

-- ============================================================================
-- 1. CHECK AND RENAME TABLE
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'intermediate_tanks') THEN
        -- Rename back to original name
        ALTER TABLE public.intermediate_tanks RENAME TO intermediate_lots;
        
        RAISE NOTICE 'Table renamed: intermediate_tanks → intermediate_lots';
    ELSE
        RAISE NOTICE 'Table intermediate_lots already exists or intermediate_tanks not found';
    END IF;
END $$;

-- ============================================================================
-- 2. ENSURE CORRECT SCHEMA
-- ============================================================================

-- Add missing columns if they don't exist
ALTER TABLE public.intermediate_lots
    ADD COLUMN IF NOT EXISTS tank_id UUID REFERENCES public.mixing_tanks(id),
    ADD COLUMN IF NOT EXISTS quantity NUMERIC,
    ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'L';

-- Remove deprecated JSONB ingredients column (will be replaced by separate table)
ALTER TABLE public.intermediate_lots 
    DROP COLUMN IF EXISTS ingredients;

-- Remove old refactored columns if they exist
ALTER TABLE public.intermediate_lots
    DROP COLUMN IF EXISTS tank_code,
    DROP COLUMN IF EXISTS syrup_name,
    DROP COLUMN IF EXISTS prepared_by,
    DROP COLUMN IF EXISTS start_at,
    DROP COLUMN IF EXISTS end_at;

-- ============================================================================
-- 3. UPDATE STATUS CONSTRAINT
-- ============================================================================

-- Drop old constraint if exists
ALTER TABLE public.intermediate_lots 
    DROP CONSTRAINT IF EXISTS intermediate_lots_status_check;

-- Add new constraint with Portuguese lifecycle values
ALTER TABLE public.intermediate_lots 
    ADD CONSTRAINT intermediate_lots_status_check 
    CHECK (status IN ('em_producao', 'terminado', 'consumido'));

-- ============================================================================
-- 4. ENSURE INDEXES EXIST
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_intermediate_lots_production_lot 
    ON public.intermediate_lots(production_lot_id);

CREATE INDEX IF NOT EXISTS idx_intermediate_lots_tank 
    ON public.intermediate_lots(tank_id);

CREATE INDEX IF NOT EXISTS idx_intermediate_lots_status 
    ON public.intermediate_lots(status);

-- ============================================================================
-- 5. UPDATE RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.intermediate_lots ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.intermediate_lots;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.intermediate_lots;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.intermediate_lots;

-- Create new policies
CREATE POLICY "intermediate_lots_select_policy"
    ON public.intermediate_lots FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "intermediate_lots_insert_policy"
    ON public.intermediate_lots FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "intermediate_lots_update_policy"
    ON public.intermediate_lots FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "intermediate_lots_delete_policy"
    ON public.intermediate_lots FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================================
-- 6. ADD COMMENTS
-- ============================================================================

COMMENT ON TABLE public.intermediate_lots IS 'Lotes intermédios - xaropes, bases e produtos semi-acabados';
COMMENT ON COLUMN public.intermediate_lots.status IS 'Lifecycle: em_producao (in production), terminado (completed), consumido (consumed)';
COMMENT ON COLUMN public.intermediate_lots.tank_id IS 'Reference to mixing tank from production_settings';
