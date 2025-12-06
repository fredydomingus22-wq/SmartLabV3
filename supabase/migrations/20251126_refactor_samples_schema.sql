-- Migration: Refactor Samples Schema & Production Lots
-- Description: Adds sample_types table, links samples to it, enhances production_lots and lab_analysis.

-- 1. Create sample_types table
CREATE TABLE IF NOT EXISTS sample_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'production', 'quality', 'environmental'
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    tenant_id UUID
);

-- Enable RLS
ALTER TABLE sample_types ENABLE ROW LEVEL SECURITY;

-- Create policy for read access (authenticated users)
CREATE POLICY "Authenticated users can view sample types"
    ON sample_types FOR SELECT
    TO authenticated
    USING (true);

-- 2. Seed Data
INSERT INTO sample_types (code, name, category) VALUES
('finished_product', 'Produto Final', 'production'),
('intermediate_product', 'Produto Intermédio', 'production'),
('raw_material', 'Matéria-Prima', 'production'),
('environmental_swab', 'Zaragatoa Ambiental', 'environmental'),
('equipment_swab', 'Zaragatoa de Equipamento', 'environmental'),
('personnel_swab', 'Zaragatoa de Pessoal', 'environmental'),
('water_sample', 'Amostra de Água', 'environmental'),
('air_sample', 'Amostra de Ar', 'environmental'),
('other', 'Outro', 'other'),
('line_inspection', 'Inspecção de Linha', 'production')
ON CONFLICT (code) DO NOTHING;

-- 3. Update samples table
ALTER TABLE samples 
ADD COLUMN IF NOT EXISTS sample_type_id UUID REFERENCES sample_types(id);

-- Migrate existing data
UPDATE samples s
SET sample_type_id = st.id
FROM sample_types st
WHERE s.sample_type = st.code;

-- 4. Update production_lots
ALTER TABLE production_lots 
ADD COLUMN IF NOT EXISTS intermediate_lot_id UUID REFERENCES intermediate_lots(id),
ADD COLUMN IF NOT EXISTS source_tank_id UUID REFERENCES tanks(id);

-- 5. Update lab_analysis
ALTER TABLE lab_analysis
ADD COLUMN IF NOT EXISTS spec_min NUMERIC,
ADD COLUMN IF NOT EXISTS spec_max NUMERIC,
ADD COLUMN IF NOT EXISTS spec_target NUMERIC,
ADD COLUMN IF NOT EXISTS spec_snapshot_at TIMESTAMPTZ DEFAULT NOW();

-- 6. Create View: lot_quality_summary
CREATE OR REPLACE VIEW lot_quality_summary AS
SELECT 
    pl.id as production_lot_id,
    pl.code as lot_code,
    p.name as product_name,
    COUNT(DISTINCT s.id) as total_samples,
    COUNT(DISTINCT CASE WHEN la.result_status = 'within_spec' THEN la.id END) as passed_tests,
    COUNT(DISTINCT CASE WHEN la.result_status != 'within_spec' THEN la.id END) as failed_tests
FROM production_lots pl
JOIN samples s ON s.production_lot_id = pl.id
JOIN lab_analysis la ON la.sample_id = s.id
JOIN products p ON pl.product_id = p.id
GROUP BY pl.id, pl.code, p.name;

-- Grant access to view
GRANT SELECT ON lot_quality_summary TO authenticated;
