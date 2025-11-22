-- Equipment Management Tables
-- This migration creates tables for tracking laboratory equipment and calibration

-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS public.equipment_maintenance CASCADE;
DROP TABLE IF EXISTS public.equipment CASCADE;

-- Create equipment table
CREATE TABLE public.equipment (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    location TEXT,
    calibration_due DATE,
    last_calibrated DATE,
    calibration_frequency_days INTEGER,
    status TEXT DEFAULT 'active',
    responsible UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT equipment_status_check CHECK (status IN ('active', 'inactive', 'maintenance', 'calibration_due'))
);

-- Indexes for equipment
CREATE INDEX idx_equipment_status ON public.equipment(status);
CREATE INDEX idx_equipment_calibration_due ON public.equipment(calibration_due);
CREATE INDEX idx_equipment_type ON public.equipment(type);
CREATE INDEX idx_equipment_code ON public.equipment(code);

-- Equipment Maintenance History (for future use)
CREATE TABLE public.equipment_maintenance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    equipment_id UUID REFERENCES public.equipment(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,
    description TEXT,
    performed_by UUID REFERENCES public.profiles(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    next_due_date DATE,
    cost NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_equipment_maintenance_equipment ON public.equipment_maintenance(equipment_id);
CREATE INDEX idx_equipment_maintenance_type ON public.equipment_maintenance(maintenance_type);
