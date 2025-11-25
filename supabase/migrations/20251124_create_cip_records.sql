-- Create CIP Records Table
-- Date: 2025-11-24

CREATE TABLE IF NOT EXISTS cip_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tank_id UUID REFERENCES mixing_tanks(id) ON DELETE SET NULL,
    line_id UUID REFERENCES production_lines(id) ON DELETE SET NULL,
    shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    cleaning_type TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for CIP Records
ALTER TABLE cip_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read cip_records" ON cip_records;
CREATE POLICY "Authenticated users can read cip_records"
    ON cip_records FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can write cip_records" ON cip_records;
CREATE POLICY "Authenticated users can write cip_records"
    ON cip_records FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_cip_records_updated_at ON cip_records;
CREATE TRIGGER update_cip_records_updated_at
    BEFORE UPDATE ON cip_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
