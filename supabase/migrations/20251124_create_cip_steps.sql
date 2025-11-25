-- Create CIP Steps Table
-- Date: 2025-11-24

CREATE TABLE IF NOT EXISTS cip_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cip_record_id UUID REFERENCES cip_records(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
    chemical_concentration TEXT, -- e.g., "5% NaOH"
    duration_minutes INTEGER,
    water_ph NUMERIC,
    technician_signature TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for CIP Steps
ALTER TABLE cip_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read cip_steps" ON cip_steps;
CREATE POLICY "Authenticated users can read cip_steps"
    ON cip_steps FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can write cip_steps" ON cip_steps;
CREATE POLICY "Authenticated users can write cip_steps"
    ON cip_steps FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_cip_steps_updated_at ON cip_steps;
CREATE TRIGGER update_cip_steps_updated_at
    BEFORE UPDATE ON cip_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
