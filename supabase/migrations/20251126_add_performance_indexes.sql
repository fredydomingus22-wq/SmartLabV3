-- ============================================================================
-- PERFORMANCE INDEXES
-- Date: 2025-11-26
-- Phase: 2 - Data Model Cleanup
-- Description: Add indexes to improve query performance for common access patterns
-- Note: Using CONCURRENTLY to avoid locking tables during index creation
-- ============================================================================

-- ============================================================================
-- STEP 1: Status Filter Indexes (for list/queue views)
-- ============================================================================

-- Production Lots - filter by active statuses
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_production_lots_status 
ON production_lots(status) 
WHERE status IN ('draft', 'active', 'on_hold');

-- Intermediate Lots
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_intermediate_lots_status 
ON intermediate_lots(status)
WHERE status != 'cancelled';

-- Finished Lots
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_finished_lots_status 
ON finished_lots(status)
WHERE status != 'cancelled';

-- Samples - most queries filter pending/in analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_samples_status 
ON samples(status)
WHERE status IN ('pending', 'in_analysis', 'under_review');

-- Non-Conformities - filter open NCs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nc_status 
ON non_conformities(status)
WHERE status NOT IN ('closed', 'rejected');

-- NC Actions - filter active actions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nc_actions_status 
ON nc_actions(status)
WHERE status IN ('not_started', 'in_progress', 'overdue');

-- ============================================================================
-- STEP 2: Date Range Query Indexes
-- ============================================================================

-- Samples - sorted by collection date (DESC for recent first)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_samples_collected_at 
ON samples(collected_at DESC);

-- Production Lots - sorted by creation date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_production_lots_created_at 
ON production_lots(created_at DESC);

-- Non-Conformities - sorted by opened date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nc_opened_at 
ON non_conformities(opened_at DESC);

-- Audits - sorted by audit date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audits_audit_date 
ON audits(audit_date DESC);

-- Trainings - sorted by scheduled date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainings_scheduled_date 
ON trainings(scheduled_date);

-- ============================================================================
-- STEP 3: Code Lookup Indexes
-- ============================================================================

-- Products - search/filter by code
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_code 
ON products(code);

-- Raw Materials - search by code
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_raw_materials_code 
ON raw_materials(code);

-- Equipment - search by code
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_equipment_code 
ON equipment(code);

-- Samples - search by code
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_samples_code 
ON samples(code);

-- Production Lots - already has unique constraint which creates index
-- But add text pattern ops for LIKE queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_production_lots_lot_code_pattern 
ON production_lots(lot_code text_pattern_ops);

-- ============================================================================
-- STEP 4: Foreign Key Join Indexes
-- ============================================================================

-- Samples → Product (for filtering samples by product)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_samples_product_id 
ON samples(product_id) 
WHERE product_id IS NOT NULL;

-- Samples → Production Lot (for lot-to-samples traceability)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_samples_production_lot_id 
ON samples(production_lot_id)
WHERE production_lot_id IS NOT NULL;

-- Samples → Assigned To (for workload queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_samples_assigned_to 
ON samples(assigned_to)
WHERE assigned_to IS NOT NULL;

-- Specifications → Product (for product spec lookups)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_specifications_product_id 
ON specifications(product_id);

-- NC → Product (for product quality analysis)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nc_product_id 
ON non_conformities(product_id)
WHERE product_id IS NOT NULL;

-- NC Actions → NC (for loading actions with NC)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nc_actions_nc_id 
ON nc_actions(nc_id);

-- ============================================================================
-- STEP 5: Composite Indexes (for common combined filters)
-- ============================================================================

-- Samples: filter by type AND status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_samples_type_status 
ON samples(sample_type, status);

-- Samples: filter by status AND priority (for queue sorting)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_samples_status_priority 
ON samples(status, priority, collected_at DESC)
WHERE status IN ('pending', 'in_analysis');

-- Production Lots: filter by product AND status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_production_lots_product_status 
ON production_lots(product_id, status);

-- NC: filter by type AND status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_nc_type_status 
ON non_conformities(type, status);

-- Equipment: filter by status (for maintenance tracking)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_equipment_status 
ON equipment(status)
WHERE status IN ('maintenance', 'calibration_due');

-- ============================================================================
-- STEP 6: Text Search Indexes (for name/description searches)
-- ============================================================================

-- Products - search by name (case-insensitive)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name_lower 
ON products(LOWER(name));

-- Equipment - search by name
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_equipment_name_lower 
ON equipment(LOWER(name));

-- Parameters - search by name
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_parameters_name_lower 
ON parameters(LOWER(name));

-- ============================================================================
-- STEP 7: Tenant Isolation Indexes (already added in Phase 1, verify)
-- ============================================================================

-- Verify tenant_id indexes exist (should have been created in Phase 1)
-- These are critical for multi-tenant query performance

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE '%tenant%'
ORDER BY tablename;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- List all indexes created
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check index usage statistics (run after application load)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Test query performance with EXPLAIN
/*
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM samples 
WHERE status = 'pending' 
AND sample_type = 'finished_product'
ORDER BY priority DESC, collected_at ASC
LIMIT 50;

-- Expected: Should use idx_samples_type_status or idx_samples_status_priority
*/
