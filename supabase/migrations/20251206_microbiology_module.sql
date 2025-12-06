-- =====================================================
-- SmartLab V3 — Microbiology Module
-- Migration: 20251206_microbiology_module.sql
-- Based on: docs/erd_mental.md Section 6
-- =====================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. MICRO_MEDIA_TYPES (Culture Media Definitions)
-- =====================================================
CREATE TABLE IF NOT EXISTS micro_media_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Media identification
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Incubation parameters
    incubation_temp_min NUMERIC(5,2),      -- °C
    incubation_temp_max NUMERIC(5,2),      -- °C
    incubation_hours_min INTEGER,           -- Minimum hours
    incubation_hours_max INTEGER,           -- Maximum hours
    
    -- Target organisms
    target_organisms TEXT[],                -- e.g., ['Total Aerobics', 'Mesophiles']
    
    -- Configuration
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uq_micro_media_types_code UNIQUE (tenant_id, code)
);

COMMENT ON TABLE micro_media_types IS 'Culture media definitions (PCA, VRB, MacConkey, etc.)';

-- =====================================================
-- 2. MICRO_MEDIA_LOTS (Media Inventory)
-- =====================================================
CREATE TABLE IF NOT EXISTS micro_media_lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    media_type_id UUID NOT NULL REFERENCES micro_media_types(id) ON DELETE RESTRICT,
    
    -- Lot identification
    lot_code TEXT NOT NULL,
    batch_number TEXT,
    
    -- Supplier info
    supplier_name TEXT,
    manufacturer TEXT,
    
    -- Dates
    manufacture_date DATE,
    expiry_date DATE NOT NULL,
    received_date DATE DEFAULT CURRENT_DATE,
    
    -- Quantity tracking
    initial_quantity INTEGER NOT NULL,          -- Number of plates/tubes
    current_quantity INTEGER NOT NULL,          -- Remaining
    unit TEXT DEFAULT 'plates',                 -- plates, tubes, bottles
    
    -- Quality control
    qc_status TEXT DEFAULT 'pending' CHECK (qc_status IN ('pending', 'approved', 'rejected', 'expired')),
    qc_notes TEXT,
    qc_performed_by UUID REFERENCES profiles(id),
    qc_performed_at TIMESTAMPTZ,
    
    -- Storage
    storage_location TEXT,
    storage_temp_c NUMERIC(5,2),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uq_micro_media_lots_code UNIQUE (tenant_id, lot_code)
);

COMMENT ON TABLE micro_media_lots IS 'Media inventory with lot codes, expiry dates, and quantities';

-- =====================================================
-- 3. MICRO_INCUBATORS (Equipment Registry)
-- =====================================================
CREATE TABLE IF NOT EXISTS micro_incubators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    factory_id UUID REFERENCES factories(id),
    
    -- Equipment identification
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    model TEXT,
    serial_number TEXT,
    
    -- Target parameters
    setpoint_temp_c NUMERIC(5,2) NOT NULL,      -- Target temperature
    temp_tolerance NUMERIC(3,2) DEFAULT 0.5,    -- ± tolerance
    
    -- Capacity
    capacity_plates INTEGER,                     -- Max plates
    capacity_shelves INTEGER,
    
    -- Calibration
    last_calibration_date DATE,
    next_calibration_date DATE,
    calibration_certificate TEXT,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'out_of_service', 'calibration_due')),
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uq_micro_incubators_code UNIQUE (tenant_id, code)
);

COMMENT ON TABLE micro_incubators IS 'Incubator equipment registry with temperature setpoints and capacity';

-- =====================================================
-- 4. MICRO_TEST_SESSIONS (Incubation Run Grouping)
-- =====================================================
CREATE TABLE IF NOT EXISTS micro_test_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    incubator_id UUID REFERENCES micro_incubators(id),
    
    -- Session identification
    session_code TEXT NOT NULL,
    
    -- Timing
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_end_at TIMESTAMPTZ,
    actual_end_at TIMESTAMPTZ,
    
    -- Temperature monitoring
    target_temp_c NUMERIC(5,2),
    min_temp_recorded NUMERIC(5,2),
    max_temp_recorded NUMERIC(5,2),
    avg_temp_recorded NUMERIC(5,2),
    
    -- Status
    status TEXT DEFAULT 'incubating' CHECK (status IN ('incubating', 'reading', 'completed', 'aborted')),
    
    -- Personnel
    started_by UUID REFERENCES profiles(id),
    completed_by UUID REFERENCES profiles(id),
    
    -- Notes
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    
    CONSTRAINT uq_micro_test_sessions_code UNIQUE (tenant_id, session_code)
);

COMMENT ON TABLE micro_test_sessions IS 'Groups related tests in same incubation run';

-- =====================================================
-- 5. MICRO_RESULTS (Colony Count Results)
-- =====================================================
CREATE TABLE IF NOT EXISTS micro_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Relationships
    sample_id UUID NOT NULL REFERENCES samples(id) ON DELETE CASCADE,
    parameter_id UUID NOT NULL REFERENCES parameters(id),
    test_session_id UUID REFERENCES micro_test_sessions(id),
    media_lot_id UUID REFERENCES micro_media_lots(id),
    
    -- Result types
    result_type TEXT NOT NULL CHECK (result_type IN ('count', 'tntc', 'presence', 'absence')),
    
    -- Colony count (when result_type = 'count')
    colony_count INTEGER,
    dilution_factor INTEGER DEFAULT 1,
    cfu_per_ml NUMERIC(15,2),                    -- Calculated: colony_count * dilution_factor
    
    -- Presence/Absence (when result_type = 'presence' or 'absence')
    is_detected BOOLEAN,
    
    -- Specification limits (snapshot at analysis time)
    spec_limit NUMERIC(15,2),
    spec_unit TEXT DEFAULT 'CFU/mL',
    
    -- Conformity
    is_conform BOOLEAN,
    deviation_percentage NUMERIC(10,2),
    
    -- Analysis details
    incubation_hours INTEGER,
    analysis_date TIMESTAMPTZ DEFAULT NOW(),
    read_by UUID REFERENCES profiles(id),
    
    -- Verification (4-eyes principle)
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    
    -- Notes
    notes TEXT,
    attachments JSONB DEFAULT '[]',
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    
    CONSTRAINT uq_micro_results_sample_param UNIQUE (sample_id, parameter_id, media_lot_id)
);

COMMENT ON TABLE micro_results IS 'Colony counts, TNTC, and presence/absence results per sample';

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_micro_media_types_tenant ON micro_media_types(tenant_id);
CREATE INDEX IF NOT EXISTS idx_micro_media_types_active ON micro_media_types(tenant_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_micro_media_lots_tenant ON micro_media_lots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_micro_media_lots_media_type ON micro_media_lots(media_type_id);
CREATE INDEX IF NOT EXISTS idx_micro_media_lots_expiry ON micro_media_lots(expiry_date);
CREATE INDEX IF NOT EXISTS idx_micro_media_lots_qc ON micro_media_lots(qc_status);

CREATE INDEX IF NOT EXISTS idx_micro_incubators_tenant ON micro_incubators(tenant_id);
CREATE INDEX IF NOT EXISTS idx_micro_incubators_status ON micro_incubators(status);

CREATE INDEX IF NOT EXISTS idx_micro_test_sessions_tenant ON micro_test_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_micro_test_sessions_incubator ON micro_test_sessions(incubator_id);
CREATE INDEX IF NOT EXISTS idx_micro_test_sessions_status ON micro_test_sessions(status);

CREATE INDEX IF NOT EXISTS idx_micro_results_tenant ON micro_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_micro_results_sample ON micro_results(sample_id);
CREATE INDEX IF NOT EXISTS idx_micro_results_session ON micro_results(test_session_id);
CREATE INDEX IF NOT EXISTS idx_micro_results_parameter ON micro_results(parameter_id);
CREATE INDEX IF NOT EXISTS idx_micro_results_verification ON micro_results(verification_status);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE micro_media_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_media_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_incubators ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_results ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY "micro_media_types_tenant_isolation" ON micro_media_types
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "micro_media_lots_tenant_isolation" ON micro_media_lots
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "micro_incubators_tenant_isolation" ON micro_incubators
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "micro_test_sessions_tenant_isolation" ON micro_test_sessions
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "micro_results_tenant_isolation" ON micro_results
    FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- =====================================================
-- SEED DATA: Common Culture Media Types
-- =====================================================
-- Note: This will be inserted per-tenant on first setup
-- Example common media types for reference:
-- 
-- PCA (Plate Count Agar) - Total aerobic count, 30-35°C, 48-72h
-- VRB (Violet Red Bile Agar) - Coliforms, 30-37°C, 24h
-- VRBG (Violet Red Bile Glucose Agar) - Enterobacteriaceae, 30-37°C, 24h
-- MacConkey - Gram-negative, 35-37°C, 24h
-- YGC (Yeast Glucose Chloramphenicol) - Yeasts & Molds, 25°C, 5 days
-- MRS (de Man, Rogosa, Sharpe) - Lactobacilli, 30-37°C, 48h
-- Baird-Parker - S. aureus, 35-37°C, 48h
-- XLD (Xylose Lysine Deoxycholate) - Salmonella, 35-37°C, 24h
