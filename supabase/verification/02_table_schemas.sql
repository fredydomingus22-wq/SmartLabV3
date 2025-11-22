-- VERIFICATION SCRIPT 2: Detailed schema for each table
-- Execute this to see the structure of existing tables

-- Get detailed column information for all tables
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    CASE 
        WHEN pk.column_name IS NOT NULL THEN '🔑 PRIMARY KEY'
        WHEN fk.column_name IS NOT NULL THEN '🔗 FOREIGN KEY → ' || fk.foreign_table_name
        ELSE ''
    END as key_info
FROM information_schema.tables t
JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
LEFT JOIN (
    SELECT 
        kcu.column_name,
        kcu.table_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON c.column_name = pk.column_name AND c.table_name = pk.table_name
LEFT JOIN (
    SELECT 
        kcu.column_name,
        kcu.table_name,
        ccu.table_name AS foreign_table_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON c.column_name = fk.column_name AND c.table_name = fk.table_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;
