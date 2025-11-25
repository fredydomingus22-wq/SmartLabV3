-- Create Production Settings Tables (Lines, Tanks, Shifts)
-- Date: 2025-11-24

-- ============================================================================
-- 1. PRODUCTION LINES
-- ============================================================================
CREATE TABLE IF NOT EXISTS production_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    capacity_per_hour NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Production Lines
ALTER TABLE production_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read production_lines"
    ON production_lines FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can write production_lines"
    ON production_lines FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 2. MIXING TANKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS mixing_tanks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    capacity NUMERIC NOT NULL, -- in liters
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cleaning', 'maintenance', 'inactive')),
    current_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    last_cleaned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Mixing Tanks
ALTER TABLE mixing_tanks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read mixing_tanks"
    ON mixing_tanks FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can write mixing_tanks"
    ON mixing_tanks FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 3. SHIFTS (WORK GROUPS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g., "Turno A", "Manhã"
    code TEXT UNIQUE,   -- e.g., "TA"
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Shifts
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read shifts"
    ON shifts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can write shifts"
    ON shifts FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 4. TRIGGERS FOR UPDATED_AT
-- ============================================================================
CREATE TRIGGER update_production_lines_updated_at
    BEFORE UPDATE ON production_lines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mixing_tanks_updated_at
    BEFORE UPDATE ON mixing_tanks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at
    BEFORE UPDATE ON shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
