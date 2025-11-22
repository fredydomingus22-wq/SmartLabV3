-- VERIFICATION SCRIPT 1: List all existing tables
-- Execute this in Supabase SQL Editor to see what tables already exist

-- Part 1: List all user tables in public schema
SELECT 
    tablename as table_name,
    CASE 
        WHEN rowsecurity THEN '✅ Enabled'
        ELSE '❌ Disabled'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Part 2: Count rows in each table (to see which have data)
SELECT 
    schemaname,
    relname AS table_name,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- Part 3: List all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
