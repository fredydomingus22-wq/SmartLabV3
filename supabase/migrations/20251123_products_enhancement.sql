-- Products Enhancement: Add Specs and Tests Tracking
-- Migration: 20251123_products_enhancement.sql

-- ============================================================================
-- 1. EXTEND PRODUCTS TABLE
-- ============================================================================

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS product_type TEXT CHECK (product_type IN ('beverage', 'syrup', 'concentrate', 'other')),
ADD COLUMN IF NOT EXISTS shelf_life_days INTEGER,
ADD COLUMN IF NOT EXISTS storage_conditions TEXT,
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. CREATE PRODUCT_SPECS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    parameter_id UUID NOT NULL REFERENCES parameters(id) ON DELETE RESTRICT,
    
    -- Specification limits
    spec_min NUMERIC,
    spec_target NUMERIC,
    spec_max NUMERIC,
    unit TEXT,
    
    -- Test configuration
    test_frequency TEXT CHECK (test_frequency IN ('per_batch', 'daily', 'weekly', 'per_tank', 'per_sample')),
    test_level TEXT CHECK (test_level IN ('incoming', 'in_process', 'finished', 'line')),
    is_critical BOOLEAN DEFAULT false,
    
    -- Additional info
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one spec per parameter per product
    UNIQUE(product_id, parameter_id)
);

-- Indexes for performance
CREATE INDEX idx_product_specs_product ON product_specs(product_id);
CREATE INDEX idx_product_specs_parameter ON product_specs(parameter_id);
CREATE INDEX idx_product_specs_critical ON product_specs(product_id, is_critical) WHERE is_critical = true;

-- Trigger for updated_at
CREATE TRIGGER update_product_specs_updated_at
    BEFORE UPDATE ON product_specs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. CREATE PRODUCT_TESTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- References
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    production_lot_id UUID REFERENCES production_lots(id) ON DELETE SET NULL,
    tank_id UUID REFERENCES intermediate_tanks(id) ON DELETE SET NULL,
    sample_id UUID REFERENCES line_samples(id) ON DELETE SET NULL,
    parameter_id UUID NOT NULL REFERENCES parameters(id) ON DELETE RESTRICT,
    
    -- Measurement data
    measured_value NUMERIC NOT NULL,
    spec_min NUMERIC,
    spec_target NUMERIC,
    spec_max NUMERIC,
    unit TEXT,
    
    -- Result
    result_status TEXT NOT NULL CHECK (result_status IN ('in_spec', 'out_of_spec')),
    
    -- Test info
    test_level TEXT NOT NULL CHECK (test_level IN ('incoming', 'in_process', 'finished', 'line')),
    tested_by TEXT,
    tested_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_product_tests_product ON product_tests(product_id);
CREATE INDEX idx_product_tests_lot ON product_tests(production_lot_id);
CREATE INDEX idx_product_tests_tank ON product_tests(tank_id);
CREATE INDEX idx_product_tests_sample ON product_tests(sample_id);
CREATE INDEX idx_product_tests_parameter ON product_tests(parameter_id);
CREATE INDEX idx_product_tests_date ON product_tests(tested_at DESC);
CREATE INDEX idx_product_tests_status ON product_tests(product_id, result_status);
CREATE INDEX idx_product_tests_level ON product_tests(product_id, test_level);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE product_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tests ENABLE ROW LEVEL SECURITY;

-- Product Specs Policies
CREATE POLICY "Public can view product specs"
    ON product_specs FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert product specs"
    ON product_specs FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product specs"
    ON product_specs FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product specs"
    ON product_specs FOR DELETE
    USING (auth.role() = 'authenticated');

-- Product Tests Policies
CREATE POLICY "Public can view product tests"
    ON product_tests FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert product tests"
    ON product_tests FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product tests"
    ON product_tests FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ============================================================================
-- 5. HELPFUL VIEWS
-- ============================================================================

-- View for product quality summary
CREATE OR REPLACE VIEW product_quality_summary AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.sku,
    COUNT(DISTINCT ps.id) as total_specs,
    COUNT(DISTINCT CASE WHEN ps.is_critical THEN ps.id END) as critical_specs,
    COUNT(pt.id) as total_tests,
    COUNT(CASE WHEN pt.result_status = 'in_spec' THEN 1 END) as tests_passed,
    COUNT(CASE WHEN pt.result_status = 'out_of_spec' THEN 1 END) as tests_failed,
    CASE 
        WHEN COUNT(pt.id) > 0 
        THEN ROUND(100.0 * COUNT(CASE WHEN pt.result_status = 'in_spec' THEN 1 END) / COUNT(pt.id), 2)
        ELSE NULL 
    END as pass_rate,
    MAX(pt.tested_at) as last_test_date
FROM products p
LEFT JOIN product_specs ps ON p.id = ps.product_id
LEFT JOIN product_tests pt ON p.id = pt.product_id
GROUP BY p.id, p.name, p.sku;

-- ============================================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE product_specs IS 'Quality specifications (parameters and limits) for products';
COMMENT ON TABLE product_tests IS 'Historical record of all quality tests performed on products';
COMMENT ON COLUMN product_specs.test_frequency IS 'How often this parameter should be tested';
COMMENT ON COLUMN product_specs.test_level IS 'At which production stage this test is performed';
COMMENT ON COLUMN product_specs.is_critical IS 'Whether this parameter is critical for product release';
COMMENT ON COLUMN product_tests.result_status IS 'Whether the test result was within specification';
COMMENT ON COLUMN product_tests.test_level IS 'Production stage where this test was performed';
