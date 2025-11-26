-- ============================================================================
-- E-SIGNATURE SYSTEM
-- Date: 2025-11-26
-- Phase: 1 Week 2 - Security & Compliance Foundation
-- Description: Electronic signature system for 21 CFR Part 11 compliance
-- ============================================================================

CREATE TABLE IF NOT EXISTS e_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- What was signed
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    meaning TEXT NOT NULL CHECK (meaning IN ('approved', 'reviewed', 'witnessed', 'performed', 'verified')),
    
    -- Who signed
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    user_email TEXT NOT NULL,
    user_full_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    
    -- Signature data
    signature_hash TEXT NOT NULL,  -- Cryptographic hash of signature
    
    -- When and where
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- Context
    tenant_id UUID REFERENCES tenants(id),
    comment TEXT,
    
    -- Audit metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one signature per user per entity per meaning
    UNIQUE(entity_type, entity_id, user_id, meaning)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_e_signatures_entity ON e_signatures(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_e_signatures_user ON e_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_e_signatures_tenant ON e_signatures(tenant_id);
CREATE INDEX IF NOT EXISTS idx_e_signatures_signed_at ON e_signatures(signed_at DESC);

-- Enable RLS
ALTER TABLE e_signatures ENABLE ROW LEVEL SECURITY;

-- RLS Policies - signatures are immutable
CREATE POLICY "e_signatures_insert_only" ON e_signatures
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
    );

CREATE POLICY "e_signatures_select" ON e_signatures
    FOR SELECT TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'auditor'))
    );

-- Prevent updates and deletes (immutable)
CREATE POLICY "e_signatures_no_updates" ON e_signatures
    FOR UPDATE TO authenticated
    USING (false);

CREATE POLICY "e_signatures_no_deletes" ON e_signatures
    FOR DELETE TO authenticated
    USING (false);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to get all signatures for an entity
CREATE OR REPLACE FUNCTION get_entity_signatures(
    p_entity_type TEXT,
    p_entity_id UUID
)
RETURNS TABLE (
    id UUID,
    meaning TEXT,
    user_email TEXT,
    user_full_name TEXT,
    user_role TEXT,
    signed_at TIMESTAMPTZ,
    comment TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        id,
        meaning,
        user_email,
        user_full_name,
        user_role,
        signed_at,
        comment
    FROM e_signatures
    WHERE entity_type = p_entity_type
    AND entity_id = p_entity_id
    ORDER BY signed_at DESC;
$$;

-- Function to check if entity has required signature
CREATE OR REPLACE FUNCTION has_signature(
    p_entity_type TEXT,
    p_entity_id UUID,
    p_meaning TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM e_signatures
        WHERE entity_type = p_entity_type
        AND entity_id = p_entity_id
        AND meaning = p_meaning
    );
$$;

-- ============================================================================
-- Signature Requirements Table (defines what needs to be signed)
-- ============================================================================

CREATE TABLE IF NOT EXISTS signature_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,
    workflow_status TEXT NOT NULL,
    required_meaning TEXT NOT NULL CHECK (required_meaning IN ('approved', 'reviewed', 'witnessed', 'performed', 'verified')),
    required_role TEXT NOT NULL,
    description TEXT,
    tenant_id UUID REFERENCES tenants(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(entity_type, workflow_status, required_meaning, tenant_id)
);

-- Example signature requirements (customize per tenant)
INSERT INTO signature_requirements (entity_type, workflow_status, required_meaning, required_role, description)
VALUES 
    ('nc', 'closed', 'approved', 'manager', 'Manager must approve NC closure'),
    ('samples', 'approved', 'approved', 'supervisor', 'Supervisor must approve sample results'),
    ('specifications', 'active', 'approved', 'manager', 'Manager must approve specifications'),
    ('food_safety_pcc', 'verified', 'verified', 'supervisor', 'Supervisor must verify PCC')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE signature_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "signature_requirements_select" ON signature_requirements
    FOR SELECT TO authenticated
    USING (
        tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
        OR tenant_id IS NULL  -- Global requirements
    );

-- ============================================================================
-- Audit trigger for e_signatures
-- ============================================================================

DROP TRIGGER IF EXISTS audit_e_signatures ON e_signatures;
CREATE TRIGGER audit_e_signatures
    AFTER INSERT ON e_signatures  -- Only INSERT allowed
    FOR EACH ROW EXECUTE FUNCTION audit_changes();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show signature requirements
SELECT * FROM signature_requirements ORDER BY entity_type, workflow_status;

-- Test signature enforcement
SELECT has_signature('nc', '00000000-0000-0000-0000-000000000000'::UUID, 'approved');
