-- Fix all 406/400 errors in dashboard queries
-- These errors happen because RLS blocks queries or columns don't exist

-- ============================================================================
-- STEP 1: Fix RLS policies for all dashboard tables
-- ============================================================================

-- NC table - create policy if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'nc' AND policyname = 'allow_authenticated_select_nc'
    ) THEN
        CREATE POLICY "allow_authenticated_select_nc"
        ON public.nc FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- Finished lots table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'finished_lots' AND policyname = 'allow_authenticated_select_finished_lots'
    ) THEN
        CREATE POLICY "allow_authenticated_select_finished_lots"
        ON public.finished_lots FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- Production lots table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'production_lots' AND policyname = 'allow_authenticated_select_production_lots'
    ) THEN
        CREATE POLICY "allow_authenticated_select_production_lots"
        ON public.production_lots FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- Food safety PCC table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'food_safety_pcc' AND policyname = 'allow_authenticated_select_pcc'
    ) THEN
        CREATE POLICY "allow_authenticated_select_pcc"
        ON public.food_safety_pcc FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- Parameters table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'parameters' AND policyname = 'allow_authenticated_select_parameters'
    ) THEN
        CREATE POLICY "allow_authenticated_select_parameters"
        ON public.parameters FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- Lab analysis table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'lab_analysis' AND policyname = 'allow_authenticated_select_lab_analysis'
    ) THEN
        CREATE POLICY "allow_authenticated_select_lab_analysis"
        ON public.lab_analysis FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- Audits table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'audits' AND policyname = 'allow_authenticated_select_audits'
    ) THEN
        CREATE POLICY "allow_authenticated_select_audits"
        ON public.audits FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Fix samples table (error 400 - missing column)
-- ============================================================================

-- Check if analyzed_at column exists in samples table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'samples' AND column_name = 'analyzed_at'
    ) THEN
        -- Add analyzed_at column if it doesn't exist
        ALTER TABLE public.samples ADD COLUMN analyzed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add RLS policy for samples
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'samples' AND policyname = 'allow_authenticated_select_samples'
    ) THEN
        CREATE POLICY "allow_authenticated_select_samples"
        ON public.samples FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- ============================================================================
-- STEP 3: Verify all policies were created
-- ============================================================================

SELECT 
    tablename, 
    policyname, 
    cmd as operation
FROM pg_policies 
WHERE tablename IN (
    'nc', 'finished_lots', 'production_lots', 'food_safety_pcc', 
    'parameters', 'lab_analysis', 'audits', 'samples'
)
ORDER BY tablename, policyname;
