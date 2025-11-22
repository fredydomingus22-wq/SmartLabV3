-- Verify reagents table structure
-- Execute this to see what exists

-- 1. Check table exists
SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'reagents'
) as reagents_table_exists;

-- 2. Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'reagents'
ORDER BY ordinal_position;

-- 3. Check RLS and policies
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables
WHERE tablename = 'reagents';

SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'reagents';

-- 4. Check related tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND (tablename LIKE '%reagent%' OR tablename LIKE '%stock%')
ORDER BY tablename;

-- 5. Sample data
SELECT COUNT(*) as total_reagents FROM reagents;
SELECT * FROM reagents LIMIT 3;
