-- Migration: Create intermediate_lot_ingredients table
-- Date: 2025-11-25
-- Purpose: Replace JSONB ingredients with proper relational table for better UX
--          Technicians need structured fields, not JSON editing

-- ============================================================================
-- 1. CREATE INGREDIENTS TABLE
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

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_lot_ingredients_lot 
    ON public.intermediate_lot_ingredients(intermediate_lot_id);

CREATE INDEX IF NOT EXISTS idx_lot_ingredients_material 
    ON public.intermediate_lot_ingredients(raw_material_id);

CREATE INDEX IF NOT EXISTS idx_lot_ingredients_expiry 
    ON public.intermediate_lot_ingredients(expiry_date);

CREATE INDEX IF NOT EXISTS idx_lot_ingredients_added_at 
    ON public.intermediate_lot_ingredients(added_at DESC);

-- ============================================================================
-- 3. ENABLE RLS
-- ============================================================================

ALTER TABLE public.intermediate_lot_ingredients ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE RLS POLICIES
-- ============================================================================

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

-- ============================================================================
-- 5. ADD COMMENTS
-- ============================================================================

COMMENT ON TABLE public.intermediate_lot_ingredients IS 
    'Ingredientes usados em cada lote intermédio - rastreabilidade completa de matérias-primas';

COMMENT ON COLUMN public.intermediate_lot_ingredients.raw_material_name IS 
    'Nome do ingrediente (denormalizado para display, mesmo se raw_material for deletado)';

COMMENT ON COLUMN public.intermediate_lot_ingredients.lot_number IS 
    'Número do lote da matéria-prima utilizada';

COMMENT ON COLUMN public.intermediate_lot_ingredients.expiry_date IS 
    'Data de validade da matéria-prima (importante para rastreabilidade)';
