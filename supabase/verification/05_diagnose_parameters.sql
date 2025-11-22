-- DIAGNOSTIC: Check parameters table structure and data
-- Execute this to see what's wrong

-- 1. Check if table exists
SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'parameters'
) as parameters_exists;

-- 2. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'parameters'
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables
WHERE tablename = 'parameters';

-- 4. Check existing policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'parameters';

-- 5. Try to query data (see if there's any data)
SELECT * FROM parameters LIMIT 5;

-- 6. Check for any constraints
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'parameters'
ORDER BY tc.constraint_type, tc.constraint_name;
