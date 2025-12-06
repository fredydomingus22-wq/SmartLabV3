-- VERIFICATION SCRIPT 3: Check for missing tables
-- Execute this to see which tables the code expects but don't exist

-- Tables that should exist based on code analysis
WITH expected_tables AS (
    SELECT unnest(ARRAY[
        'profiles',
        'products',
        'production_lots',
        'intermediate_lots',
        'finished_product_lots',
        'non_conformities',
        'eight_d_reports',
        'samples',
        'lab_analysis',
        'parameters',
        'raw_materials',
        'raw_material_lots',
        'suppliers',
        'stock_movements',
        'technicians',
        'trainings',
        'training_assignments',
        'equipment',
        'equipment_maintenance',
        'food_safety_pcc',
        'audits',
        'audit_logs',
        'shift_notes',
        'form_templates',
        'form_submissions',
        'system_settings'
    ]) AS table_name
),
existing_tables AS (
    SELECT tablename AS table_name
    FROM pg_tables
    WHERE schemaname = 'public'
)

-- Show which tables are missing
SELECT 
    e.table_name,
    CASE 
        WHEN x.table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END AS status,
    CASE 
        WHEN x.table_name IS NULL THEN '🔴 CREATE MIGRATION NEEDED'
        ELSE '✓ OK'
    END AS action_required
FROM expected_tables e
LEFT JOIN existing_tables x ON e.table_name = x.table_name
ORDER BY 
    CASE WHEN x.table_name IS NULL THEN 0 ELSE 1 END,
    e.table_name;
