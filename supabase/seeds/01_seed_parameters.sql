-- Seed Data: Insert initial parameters for dashboard and quality control
-- Execute this to fix 406/400 errors on parameters queries

-- Ensure we can upsert by name (idempotent seeding)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'parameters_name_key'
          AND conrelid = 'public.parameters'::regclass
    ) THEN
        ALTER TABLE public.parameters
        ADD CONSTRAINT parameters_name_key UNIQUE (name);
    END IF;
END $$;

INSERT INTO parameters (name, unit, type, spec_min, spec_max, criticality, method, frequency)
VALUES
    -- Process Parameters (for production monitoring)
    ('brix', 'degBrix', 'numeric', 10.0, 14.0, 'major', 'Refractometer', 'every_lot'),
    ('ph', 'pH', 'numeric', 3.0, 4.5, 'major', 'pH Meter', 'every_lot'),
    ('acidity', '%', 'numeric', 0.3, 0.6, 'minor', 'Titration', 'every_lot'),
    ('co2', 'g/L', 'numeric', 3.5, 5.0, 'minor', 'Carbotester', 'every_lot'),
    ('density', 'g/cm3', 'numeric', 1.00, 1.10, 'minor', 'Densitometer', 'daily'),
    
    -- Quality Parameters (for lab analysis)
    ('turbidity', 'NTU', 'numeric', 0, 5, 'minor', 'Turbidimeter', 'every_lot'),
    ('color', 'EBC', 'numeric', 5, 15, 'minor', 'Spectrophotometer', 'every_lot'),
    ('alcohol', '% ABV', 'numeric', 4.0, 6.0, 'major', 'Alcoholmeter', 'every_lot'),
    ('original_gravity', 'OG', 'numeric', 1.040, 1.060, 'minor', 'Hydrometer', 'every_batch'),
    ('final_gravity', 'FG', 'numeric', 1.008, 1.016, 'minor', 'Hydrometer', 'every_batch'),
    
    -- Microbiological Parameters
    ('total_plate_count', 'CFU/mL', 'numeric', 0, 100, 'critical', 'Plate Count', 'weekly'),
    ('yeast_count', 'cells/mL', 'numeric', 1000000, 10000000, 'major', 'Microscopy', 'every_batch'),
    ('wild_yeast', 'CFU/mL', 'numeric', 0, 10, 'critical', 'Selective Media', 'weekly'),
    ('bacteria', 'CFU/mL', 'numeric', 0, 1, 'critical', 'Selective Media', 'weekly'),
    
    -- Safety Parameters
    ('temperature', 'degC', 'numeric', -2, 4, 'critical', 'Thermometer', 'hourly'),
    ('pressure', 'bar', 'numeric', 2.0, 4.0, 'major', 'Manometer', 'continuous'),
    ('oxygen', 'ppb', 'numeric', 0, 50, 'major', 'DO Meter', 'every_lot')

ON CONFLICT (name) DO NOTHING;

-- Verify insertion
SELECT COUNT(*) as total_parameters FROM parameters;
SELECT name, unit, type, criticality FROM parameters ORDER BY type, name;
