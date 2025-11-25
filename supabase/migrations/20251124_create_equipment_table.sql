-- Create Equipment Table
-- Date: 2025-11-24

CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    type TEXT, -- e.g., "Mixer", "Pump", "Heater"
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Equipment
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read equipment" ON equipment;
CREATE POLICY "Authenticated users can read equipment"
    ON equipment FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can write equipment" ON equipment;
CREATE POLICY "Authenticated users can write equipment"
    ON equipment FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_equipment_updated_at ON equipment;
CREATE TRIGGER update_equipment_updated_at
    BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
