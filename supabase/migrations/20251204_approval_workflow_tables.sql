-- Migration: Create approval workflow tables
-- Date: 2025-12-04
-- Purpose: Add approval_requests and approval_signatures tables for e-signature compliance

-- Create approval_requests table
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_by UUID NOT NULL REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES auth.users(id),
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Create approval_signatures table
CREATE TABLE IF NOT EXISTS approval_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL CHECK (action IN ('approve', 'reject')),
    signature_method TEXT NOT NULL CHECK (signature_method IN ('password', 'digital_id')),
    comments TEXT,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_approval_requests_tenant ON approval_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by ON approval_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_approval_signatures_approval ON approval_signatures(approval_request_id);
CREATE INDEX IF NOT EXISTS idx_approval_signatures_tenant ON approval_signatures(tenant_id);

-- Enable RLS
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_signatures ENABLE ROW LEVEL SECURITY;

-- RLS Policies for approval_requests
CREATE POLICY "Users can view approvals in their tenant"
    ON approval_requests FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create approval requests in their tenant"
    ON approval_requests FOR INSERT
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM tenant_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update approval requests in their tenant"
    ON approval_requests FOR UPDATE
    USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_members 
            WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for approval_signatures
CREATE POLICY "Users can view signatures in their tenant"
    ON approval_signatures FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create signatures in their tenant"
    ON approval_signatures FOR INSERT
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM tenant_members 
            WHERE user_id = auth.uid()
        )
    );
