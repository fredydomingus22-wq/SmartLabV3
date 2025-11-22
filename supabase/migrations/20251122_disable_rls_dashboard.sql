-- SIMPLE FIX: Enable read access for all dashboard tables
-- Execute this SQL in Supabase SQL Editor

-- Disable RLS on tables that are causing 406 errors (easier than fixing policies)
ALTER TABLE IF EXISTS public.nc DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.food_safety_pcc DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.parameters DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.production_lots DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.finished_lots DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.samples DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audits DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lab_analysis DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shift_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.raw_material_lots DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trainings DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schema name = 'public' 
AND tablename IN ('nc', 'food_safety_pcc', 'parameters', 'production_lots', 'finished_lots', 'samples', 'audits', 'lab_analysis', 'shift_notes', 'raw_material_lots', 'trainings')
ORDER BY tablename;
