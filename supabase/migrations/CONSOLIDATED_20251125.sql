-- ============================================================================
-- CONSOLIDATED MIGRATION SCRIPT
-- Execute this entire script in Supabase Studio SQL Editor
-- Date: 2025-11-25
-- ============================================================================

-- ============================================================================
-- MIGRATION 1: Revert intermediate_tanks to intermediate_lots
-- ============================================================================

-- Check and rename table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'intermediate_tanks') THEN
        ALTER TABLE public.intermediate_tanks RENAME TO intermediate_lots;
        RAISE NOTICE 'Table renamed: intermediate_tanks → intermediate_lots';
    ELSE
        RAISE NOTICE 'Table intermediate_lots already exists or intermediate_tanks not found';
    END IF;
END $$;

-- Ensure correct schema
ALTER TABLE public.intermediate_lots
    ADD COLUMN IF NOT EXISTS tank_id UUID REFERENCES public.mixing_tanks(id),
    ADD COLUMN IF NOT EXISTS quantity NUMERIC,
    ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'L';

-- Remove deprecated JSONB ingredients column
ALTER TABLE public.intermediate_lots 
    DROP COLUMN IF EXISTS ingredients;

-- Remove old refactored columns if they exist
ALTER TABLE public.intermediate_lots
    DROP COLUMN IF EXISTS tank_code,
    DROP COLUMN IF EXISTS syrup_name,
    DROP COLUMN IF EXISTS prepared_by,
    DROP COLUMN IF EXISTS start_at,
    DROP COLUMN IF EXISTS end_at;

-- Update status constraint
ALTER TABLE public.intermediate_lots 
    DROP CONSTRAINT IF EXISTS intermediate_lots_status_check;

ALTER TABLE public.intermediate_lots 
    ADD CONSTRAINT intermediate_lots_status_check 
    CHECK (status IN ('em_producao', 'terminado', 'consumido'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_intermediate_lots_production_lot 
    ON public.intermediate_lots(production_lot_id);

CREATE INDEX IF NOT EXISTS idx_intermediate_lots_tank 
    ON public.intermediate_lots(tank_id);

CREATE INDEX IF NOT EXISTS idx_intermediate_lots_status 
    ON public.intermediate_lots(status);

-- Enable RLS
ALTER TABLE public.intermediate_lots ENABLE ROW LEVEL SECURITY;

-- Drop old policies
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

-- Add comments
COMMENT ON TABLE public.intermediate_lots IS 'Lotes intermédios - xaropes, bases e produtos semi-acabados';
COMMENT ON COLUMN public.intermediate_lots.status IS 'Lifecycle: em_producao (in production), terminado (completed), consumido (consumed)';
COMMENT ON COLUMN public.intermediate_lots.tank_id IS 'Reference to mixing tank from production_settings';

-- ============================================================================
-- MIGRATION 2: Create intermediate_lot_ingredients table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.intermediate_lot_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intermediate_lot_id UUID NOT NULL REFERENCES public.intermediate_lots(id) ON DELETE CASCADE,
    raw_material_id UUID REFERENCES public.raw_materials(id) ON DELETE SET NULL,
    raw_material_name TEXT NOT NULL,
    lot_number TEXT,
    expiry_date DATE,
    quantity_used NUMERIC NOT NULL,
    unit TEXT DEFAULT 'kg',
    added_at TIMESTAMPTZ DEFAULT NOW(),
    added_by UUID REFERENCES public.profiles(id),
    notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lot_ingredients_lot 
    ON public.intermediate_lot_ingredients(intermediate_lot_id);

CREATE INDEX IF NOT EXISTS idx_lot_ingredients_material 
    ON public.intermediate_lot_ingredients(raw_material_id);

CREATE INDEX IF NOT EXISTS idx_lot_ingredients_expiry 
    ON public.intermediate_lot_ingredients(expiry_date);

CREATE INDEX IF NOT EXISTS idx_lot_ingredients_added_at 
    ON public.intermediate_lot_ingredients(added_at DESC);

-- Enable RLS
ALTER TABLE public.intermediate_lot_ingredients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "ingredients_select_policy"
    ON public.intermediate_lot_ingredients FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "ingredients_insert_policy"
    ON public.intermediate_lot_ingredients FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "ingredients_update_policy"
    ON public.intermediate_lot_ingredients FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "ingredients_delete_policy"
    ON public.intermediate_lot_ingredients FOR DELETE
    TO authenticated
    USING (true);

-- Add comments
COMMENT ON TABLE public.intermediate_lot_ingredients IS 
    'Ingredientes usados em cada lote intermédio - rastreabilidade completa de matérias-primas';

COMMENT ON COLUMN public.intermediate_lot_ingredients.raw_material_name IS 
    'Nome do ingrediente (denormalizado para display, mesmo se raw_material for deletado)';

COMMENT ON COLUMN public.intermediate_lot_ingredients.lot_number IS 
    'Número do lote da matéria-prima utilizada';

COMMENT ON COLUMN public.intermediate_lot_ingredients.expiry_date IS 
    'Data de validade da matéria-prima (importante para rastreabilidade)';

-- ============================================================================
-- MIGRATION 3: Add FK constraints to production_lots
-- ============================================================================

ALTER TABLE public.production_lots
    ADD COLUMN IF NOT EXISTS production_line_id UUID REFERENCES public.production_lines(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_production_lots_line_id 
    ON public.production_lots(production_line_id);

CREATE INDEX IF NOT EXISTS idx_production_lots_shift_id 
    ON public.production_lots(shift_id);

-- Add comments
COMMENT ON COLUMN public.production_lots.production_line_id IS 
    'FK to production_lines table (preferred over production_line TEXT field)';

COMMENT ON COLUMN public.production_lots.shift_id IS 
    'FK to shifts table (preferred over shift TEXT field)';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that tables exist
SELECT 'intermediate_lots' as table_name, COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'intermediate_lots'
UNION ALL
SELECT 'intermediate_lot_ingredients', COUNT(*)
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'intermediate_lot_ingredients';

-- Check indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('intermediate_lots', 'intermediate_lot_ingredients')
ORDER BY tablename, indexname;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ All migrations applied successfully!';
    RAISE NOTICE '✅ Ready to test the application';
END $$;
