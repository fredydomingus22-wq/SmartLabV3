-- Clean Duplicate RLS Policies
-- Execute this in Supabase SQL Editor after creating the new tables

-- ============================================
-- 1. Clean duplicate policies on AUDITS
-- ============================================
DROP POLICY IF EXISTS "audits admin write" ON public.audits;
DROP POLICY IF EXISTS "audits read" ON public.audits;
-- Keeping: "audits read all", "audits write admin"

-- ============================================
-- 2. Clean duplicate policies on FOOD_SAFETY_PRP
-- ============================================
DROP POLICY IF EXISTS "fs admin write" ON public.food_safety_prp;
DROP POLICY IF EXISTS "fs read all" ON public.food_safety_prp;
-- Keeping: "fs_prp read", "fs_prp write admin"

-- ============================================
-- 3. Clean duplicate policies on LAB_ANALYSIS
-- ============================================
DROP POLICY IF EXISTS "lab_analysis admin write" ON public.lab_analysis;
DROP POLICY IF EXISTS "lab_analysis read" ON public.lab_analysis;
-- Keeping: "lab_analysis read all", "lab_analysis write admin", "lab_analysis write analyst_or_admin"

-- ============================================
-- 4. Clean duplicate policies on PRODUCTION_LOTS
-- ============================================
DROP POLICY IF EXISTS "lots admin write" ON public.production_lots;
DROP POLICY IF EXISTS "lots read all" ON public.production_lots;
-- Keeping: "production_lots read", "production_lots write admin", "production_lots write owner_or_admin"

-- ============================================
-- VERIFICATION: Check remaining policies
-- ============================================
SELECT 
    tablename, 
    COUNT(*) as policy_count,
    array_agg(policyname ORDER BY policyname) as policies
FROM pg_policies
WHERE tablename IN ('audits', 'food_safety_prp', 'lab_analysis', 'production_lots')
GROUP BY tablename
ORDER BY tablename;

-- Expected results:
-- audits: 2 policies
-- food_safety_prp: 2 policies 
-- lab_analysis: 3 policies
-- production_lots: 3 policies
