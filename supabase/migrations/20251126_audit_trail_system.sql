-- ============================================================================
-- COMPREHENSIVE AUDIT TRAIL SYSTEM
-- Date: 2025-11-26
-- Phase: 1 - Security & Compliance Foundation
-- Description: Implement database-level audit logging for all critical operations
-- Compliance: ISO 17025, 21 CFR Part 11
-- ============================================================================

-- ============================================================================
-- STEP 1: Enhance audit_logs table structure
-- ============================================================================

-- Drop existing table if needed (careful in production!)
-- DROP TABLE IF EXISTS audit_logs CASCADE;

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- What happened
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    
    -- Data
    old_data JSONB,  -- NULL for INSERT
    new_data JSONB,  -- NULL for DELETE
    changed_fields TEXT[],  -- Array of field names that changed
    
    -- Who did it
    changed_by UUID REFERENCES auth.users(id),
    user_email TEXT,  -- Denormalized for performance
    user_role TEXT,   -- Role at time of change
    
    -- When
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Where/How
    ip_address INET,
    user_agent TEXT,
    
    -- Context
    tenant_id UUID REFERENCES tenants(id),
    factory_id UUID REFERENCES factories(id),
    
    -- Metadata
    description TEXT,  -- Human-readable description
    request_id TEXT,   -- For tracing related operations
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON audit_logs(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit_logs(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);

-- Make audit logs immutable (no updates or deletes allowed)
CREATE POLICY "audit_logs_insert_only" ON audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "audit_logs_read_all" ON audit_logs
    FOR SELECT TO authenticated
    USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Prevent updates and deletes
CREATE POLICY "audit_logs_no_updates" ON audit_logs
    FOR UPDATE TO authenticated
    USING (false);

CREATE POLICY "audit_logs_no_deletes" ON audit_logs
    FOR DELETE TO authenticated
    USING (false);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Create universal audit trigger function
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    user_email_val TEXT;
    user_role_val TEXT;
    tenant_id_val UUID;
    changed_fields_array TEXT[];
    field_name TEXT;
BEGIN
    -- Get user information
    SELECT email INTO user_email_val 
    FROM auth.users 
    WHERE id = auth.uid();
    
    SELECT role INTO user_role_val 
    FROM profiles 
    WHERE id = auth.uid();
    
    -- Get tenant_id from new or old record
    tenant_id_val := COALESCE(
        (NEW.tenant_id),
        (OLD.tenant_id)
    );
    
    -- For UPDATE, identify which fields changed
    IF TG_OP = 'UPDATE' THEN
        changed_fields_array := ARRAY[]::TEXT[];
        
        -- Compare OLD and NEW to find changed fields
        FOR field_name IN 
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = TG_TABLE_NAME 
            AND table_schema = 'public'
        LOOP
            IF to_jsonb(OLD)->>field_name IS DISTINCT FROM to_jsonb(NEW)->>field_name THEN
                changed_fields_array := array_append(changed_fields_array, field_name);
            END IF;
        END LOOP;
    END IF;
    
    -- Insert audit record
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        changed_fields,
        changed_by,
        user_email,
        user_role,
        changed_at,
        tenant_id,
        factory_id,
        description
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE 
            WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::JSONB 
            WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD)::JSONB
            ELSE NULL 
        END,
        CASE 
            WHEN TG_OP != 'DELETE' THEN row_to_json(NEW)::JSONB 
            ELSE NULL 
        END,
        changed_fields_array,
        auth.uid(),
        user_email_val,
        user_role_val,
        NOW(),
        tenant_id_val,
        COALESCE((NEW.factory_id), (OLD.factory_id)),
        format('%s on %s record %s', TG_OP, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id))
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION audit_changes() IS 'Universal audit trail trigger function - logs all INSERT, UPDATE, DELETE operations';

-- ============================================================================
-- STEP 3: Apply audit triggers to all critical tables
-- ============================================================================

-- Production & Lots
DROP TRIGGER IF EXISTS audit_production_lots ON production_lots;
CREATE TRIGGER audit_production_lots
    AFTER INSERT OR UPDATE OR DELETE ON production_lots
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

DROP TRIGGER IF EXISTS audit_intermediate_lots ON intermediate_lots;
CREATE TRIGGER audit_intermediate_lots
    AFTER INSERT OR UPDATE OR DELETE ON intermediate_lots
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

DROP TRIGGER IF EXISTS audit_finished_lots ON finished_lots;
CREATE TRIGGER audit_finished_lots
    AFTER INSERT OR UPDATE OR DELETE ON finished_lots
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- Samples & Lab
DROP TRIGGER IF EXISTS audit_samples ON samples;
CREATE TRIGGER audit_samples
    AFTER INSERT OR UPDATE OR DELETE ON samples
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

DROP TRIGGER IF EXISTS audit_lab_analysis ON lab_analysis;
CREATE TRIGGER audit_lab_analysis
    AFTER INSERT OR UPDATE OR DELETE ON lab_analysis
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- Quality Management
DROP TRIGGER IF EXISTS audit_nc ON nc;
CREATE TRIGGER audit_nc
    AFTER INSERT OR UPDATE OR DELETE ON nc
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

DROP TRIGGER IF EXISTS audit_eight_d_reports ON eight_d_reports;
CREATE TRIGGER audit_eight_d_reports
    AFTER INSERT OR UPDATE OR DELETE ON eight_d_reports
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- Configuration (critical for compliance)
DROP TRIGGER IF EXISTS audit_specifications ON specifications;
CREATE TRIGGER audit_specifications
    AFTER INSERT OR UPDATE OR DELETE ON specifications
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

DROP TRIGGER IF EXISTS audit_parameters ON parameters;
CREATE TRIGGER audit_parameters
    AFTER INSERT OR UPDATE OR DELETE ON parameters
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- Food Safety
DROP TRIGGER IF EXISTS audit_food_safety_pcc ON food_safety_pcc;
CREATE TRIGGER audit_food_safety_pcc
    AFTER INSERT OR UPDATE OR DELETE ON food_safety_pcc
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

DROP TRIGGER IF EXISTS audit_food_safety_oprp ON food_safety_oprp;
CREATE TRIGGER audit_food_safety_oprp
    AFTER INSERT OR UPDATE OR DELETE ON food_safety_oprp
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

DROP TRIGGER IF EXISTS audit_food_safety_prp ON food_safety_prp;
CREATE TRIGGER audit_food_safety_prp
    AFTER INSERT OR UPDATE OR DELETE ON food_safety_prp
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- Products (master data)
DROP TRIGGER IF EXISTS audit_products ON products;
CREATE TRIGGER audit_products
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- Raw Materials
DROP TRIGGER IF EXISTS audit_raw_materials ON raw_materials;
CREATE TRIGGER audit_raw_materials
    AFTER INSERT OR UPDATE OR DELETE ON raw_materials
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

DROP TRIGGER IF EXISTS audit_raw_material_lots ON raw_material_lots;
CREATE TRIGGER audit_raw_material_lots
    AFTER INSERT OR UPDATE OR DELETE ON raw_material_lots
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- Equipment
DROP TRIGGER IF EXISTS audit_equipment ON equipment;
CREATE TRIGGER audit_equipment
    AFTER INSERT OR UPDATE OR DELETE ON equipment
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- Reagents
DROP TRIGGER IF EXISTS audit_reagents ON reagents;
CREATE TRIGGER audit_reagents
    AFTER INSERT OR UPDATE OR DELETE ON reagents
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

DROP TRIGGER IF EXISTS audit_reagent_batches ON reagent_batches;
CREATE TRIGGER audit_reagent_batches
    AFTER INSERT OR UPDATE OR DELETE ON reagent_batches
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- Suppliers
DROP TRIGGER IF EXISTS audit_suppliers ON suppliers;
CREATE TRIGGER audit_suppliers
    AFTER INSERT OR UPDATE OR DELETE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- Audits
DROP TRIGGER IF EXISTS audit_audits ON audits;
CREATE TRIGGER audit_audits
    AFTER INSERT OR UPDATE OR DELETE ON audits
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- Trainings
DROP TRIGGER IF EXISTS audit_trainings ON trainings;
CREATE TRIGGER audit_trainings
    AFTER INSERT OR UPDATE OR DELETE ON trainings
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- ============================================================================
-- STEP 4: Helper functions for audit queries
-- ============================================================================

-- Function to get audit trail for a specific record
CREATE OR REPLACE FUNCTION get_audit_trail(
    p_table_name TEXT,
    p_record_id UUID
)
RETURNS TABLE (
    id UUID,
    action TEXT,
    changed_by UUID,
    user_email TEXT,
    user_role TEXT,
    changed_at TIMESTAMPTZ,
    changed_fields TEXT[],
    old_data JSONB,
    new_data JSONB
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        id,
        action,
        changed_by,
        user_email,
        user_role,
        changed_at,
        changed_fields,
        old_data,
        new_data
    FROM audit_logs
    WHERE table_name = p_table_name
    AND record_id = p_record_id
    ORDER BY changed_at DESC;
$$;

-- Function to get recent changes by user
CREATE OR REPLACE FUNCTION get_user_activity(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    table_name TEXT,
    record_id UUID,
    action TEXT,
    changed_at TIMESTAMPTZ,
    description TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        id,
        table_name,
        record_id,
        action,
        changed_at,
        description
    FROM audit_logs
    WHERE changed_by = p_user_id
    ORDER BY changed_at DESC
    LIMIT p_limit;
$$;

-- ============================================================================
-- STEP 5: Create audit report views
-- ============================================================================

-- View for compliance reporting
CREATE OR REPLACE VIEW audit_trail_summary AS
SELECT 
    table_name,
    action,
    DATE(changed_at) as date,
    COUNT(*) as operation_count,
    COUNT(DISTINCT changed_by) as unique_users
FROM audit_logs
GROUP BY table_name, action, DATE(changed_at)
ORDER BY date DESC, table_name, action;

COMMENT ON VIEW audit_trail_summary IS 'Daily summary of audit trail activity for compliance reporting';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Test audit trigger by updating a record (if data exists)
DO $$
BEGIN
    -- This will trigger the audit
    UPDATE products SET updated_at = NOW() WHERE id IN (SELECT id FROM products LIMIT 1);
    
    RAISE NOTICE 'Audit trigger test completed successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not test audit trigger: %', SQLERRM;
END $$;

-- Count audit records
SELECT 
    table_name,
    COUNT(*) as audit_count
FROM audit_logs
GROUP BY table_name
ORDER BY audit_count DESC;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
