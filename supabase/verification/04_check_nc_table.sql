-- Quick check: Does 'nc' table exist?
-- Execute this to verify

SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'nc'
) as nc_exists;

-- Also check for non_conformities
SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'non_conformities'
) as non_conformities_exists;
