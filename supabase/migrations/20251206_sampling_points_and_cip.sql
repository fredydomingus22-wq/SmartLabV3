-- =====================================================
-- SmartLab V3 — Sampling Points & CIP Blocking
-- Migration: 20251206_sampling_points_and_cip.sql
-- Based on: docs/erd_mental.md Sections 5.2 and 8
-- =====================================================

-- =====================================================
-- PART 1: SAMPLING POINTS
-- =====================================================
-- Business Rule: Sample MUST bind to sampling_point_id (FK)
-- Current Issue: samples.collection_point is free text

CREATE TABLE IF NOT EXISTS sampling_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    factory_id UUID REFERENCES factories(id),
    
    -- Identification
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Location
    location TEXT,                              -- Physical location description
    area TEXT,                                  -- Production area/zone
    equipment_id UUID REFERENCES equipment(id), -- Associated equipment if applicable
    
    -- Sample type association
    allowed_sample_types TEXT[] DEFAULT '{}',   -- Which sample_types can use this point
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uq_sampling_points_code UNIQUE (tenant_id, code)
);

COMMENT ON TABLE sampling_points IS 'Standardized sampling locations for consistent sample collection';

-- Add FK to samples table
ALTER TABLE samples ADD COLUMN IF NOT EXISTS sampling_point_id UUID REFERENCES sampling_points(id);

-- Index for sampling points
CREATE INDEX IF NOT EXISTS idx_sampling_points_tenant ON sampling_points(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sampling_points_factory ON sampling_points(factory_id);
CREATE INDEX IF NOT EXISTS idx_sampling_points_equipment ON sampling_points(equipment_id);
CREATE INDEX IF NOT EXISTS idx_samples_sampling_point ON samples(sampling_point_id);

-- RLS
ALTER TABLE sampling_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sampling_points_tenant_isolation" ON sampling_points
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- =====================================================
-- PART 2: CIP PROGRAMS (Complete Structure)
-- =====================================================
-- Business Rule: Tank cannot be used if no valid CIP

CREATE TABLE IF NOT EXISTS cip_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Program identification
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Target equipment
    target_equipment_type TEXT NOT NULL,        -- tank, mixer, line, filler
    
    -- Program configuration
    total_duration_minutes INTEGER,
    
    -- Validation
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    
    CONSTRAINT uq_cip_programs_code UNIQUE (tenant_id, code)
);

COMMENT ON TABLE cip_programs IS 'CIP cleaning program definitions';

-- =====================================================
-- CIP_PROGRAM_STEPS (Step Definitions)
-- =====================================================
CREATE TABLE IF NOT EXISTS cip_program_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES cip_programs(id) ON DELETE CASCADE,
    
    -- Step order
    step_order INTEGER NOT NULL,
    step_name TEXT NOT NULL,                    -- Pre-rinse, Caustic, Acid, Final rinse
    
    -- Target parameters
    target_temp_min NUMERIC(5,2),               -- °C minimum
    target_temp_max NUMERIC(5,2),               -- °C maximum
    target_duration_seconds INTEGER NOT NULL,
    target_concentration NUMERIC(5,2),          -- % for chemicals
    target_conductivity_min NUMERIC(10,2),      -- μS/cm
    target_conductivity_max NUMERIC(10,2),
    
    -- Chemical used
    chemical_type TEXT,                         -- caustic, acid, sanitizer, water
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_cip_program_steps UNIQUE (program_id, step_order)
);

COMMENT ON TABLE cip_program_steps IS 'Individual steps within a CIP program with target parameters';

-- =====================================================
-- CIP_EXECUTIONS (Actual Cleaning Runs)
-- =====================================================
CREATE TABLE IF NOT EXISTS cip_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES cip_programs(id),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    
    -- Execution identification
    execution_code TEXT NOT NULL,
    
    -- Timing
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Status
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'aborted')),
    overall_result TEXT CHECK (overall_result IN ('pass', 'fail', 'deviation')),
    
    -- Personnel
    performed_by UUID REFERENCES profiles(id),
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    
    -- Notes
    notes TEXT,
    deviation_notes TEXT,
    
    -- Validity period for blocking
    valid_until TIMESTAMPTZ,                    -- CIP validity expiry
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    
    CONSTRAINT uq_cip_executions_code UNIQUE (tenant_id, execution_code)
);

COMMENT ON TABLE cip_executions IS 'Actual CIP cleaning executions with results';

-- =====================================================
-- CIP_EXECUTION_STEPS (Actual Step Data)
-- =====================================================
CREATE TABLE IF NOT EXISTS cip_execution_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    execution_id UUID NOT NULL REFERENCES cip_executions(id) ON DELETE CASCADE,
    program_step_id UUID NOT NULL REFERENCES cip_program_steps(id),
    
    -- Step order
    step_order INTEGER NOT NULL,
    
    -- Actual values recorded
    actual_temp_avg NUMERIC(5,2),
    actual_temp_min NUMERIC(5,2),
    actual_temp_max NUMERIC(5,2),
    actual_duration_seconds INTEGER,
    actual_conductivity_avg NUMERIC(10,2),
    actual_conductivity_min NUMERIC(10,2),
    actual_conductivity_max NUMERIC(10,2),
    
    -- Timing
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    
    -- Result
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'pass', 'fail', 'skipped')),
    deviation_reason TEXT,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE cip_execution_steps IS 'Individual step results for CIP executions';

-- =====================================================
-- Add CIP tracking to intermediate_lots (Tank blocking)
-- =====================================================
ALTER TABLE intermediate_lots ADD COLUMN IF NOT EXISTS last_cip_execution_id UUID REFERENCES cip_executions(id);
ALTER TABLE intermediate_lots ADD COLUMN IF NOT EXISTS cip_valid_until TIMESTAMPTZ;

-- Also add to mixing_tanks
ALTER TABLE mixing_tanks ADD COLUMN IF NOT EXISTS last_cip_execution_id UUID REFERENCES cip_executions(id);
ALTER TABLE mixing_tanks ADD COLUMN IF NOT EXISTS cip_valid_until TIMESTAMPTZ;
ALTER TABLE mixing_tanks ADD COLUMN IF NOT EXISTS cip_status TEXT DEFAULT 'unknown' 
    CHECK (cip_status IN ('valid', 'expired', 'unknown', 'in_progress'));

-- =====================================================
-- INDEXES for CIP tables
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_cip_programs_tenant ON cip_programs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cip_programs_type ON cip_programs(target_equipment_type);

CREATE INDEX IF NOT EXISTS idx_cip_program_steps_program ON cip_program_steps(program_id);

CREATE INDEX IF NOT EXISTS idx_cip_executions_tenant ON cip_executions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cip_executions_equipment ON cip_executions(equipment_id);
CREATE INDEX IF NOT EXISTS idx_cip_executions_status ON cip_executions(status);
CREATE INDEX IF NOT EXISTS idx_cip_executions_validity ON cip_executions(valid_until);

CREATE INDEX IF NOT EXISTS idx_cip_execution_steps_execution ON cip_execution_steps(execution_id);

-- =====================================================
-- ROW LEVEL SECURITY for CIP tables
-- =====================================================
ALTER TABLE cip_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cip_program_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE cip_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cip_execution_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cip_programs_tenant_isolation" ON cip_programs
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "cip_program_steps_tenant_isolation" ON cip_program_steps
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "cip_executions_tenant_isolation" ON cip_executions
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "cip_execution_steps_tenant_isolation" ON cip_execution_steps
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- =====================================================
-- FUNCTION: Check if equipment has valid CIP
-- =====================================================
CREATE OR REPLACE FUNCTION check_cip_validity(p_equipment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_valid_until TIMESTAMPTZ;
BEGIN
    -- Get the latest CIP execution for this equipment
    SELECT valid_until INTO v_valid_until
    FROM cip_executions
    WHERE equipment_id = p_equipment_id
      AND status = 'completed'
      AND overall_result = 'pass'
    ORDER BY completed_at DESC
    LIMIT 1;
    
    -- Return true if CIP is still valid
    IF v_valid_until IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN v_valid_until > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_cip_validity IS 'Returns true if equipment has a valid CIP that has not expired';
