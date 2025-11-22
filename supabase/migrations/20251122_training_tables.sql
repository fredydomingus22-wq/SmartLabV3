-- Training & Competency Management Tables
-- This migration creates tables for managing training courses and user assignments

-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS public.training_assignments CASCADE;
DROP TABLE IF EXISTS public.trainings CASCADE;

-- Create trainings table
CREATE TABLE public.trainings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    instructor TEXT,
    duration_hours INTEGER,
    date DATE,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT trainings_status_check CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);

-- Training Assignments
CREATE TABLE public.training_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    training_id UUID REFERENCES public.trainings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completion_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'assigned',
    score NUMERIC,
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(training_id, user_id),
    CONSTRAINT training_assignments_status_check CHECK (status IN ('assigned', 'in_progress', 'completed', 'failed'))
);

-- Indexes for trainings
CREATE INDEX idx_trainings_status ON public.trainings(status);
CREATE INDEX idx_trainings_date ON public.trainings(date);

-- Indexes for training assignments
CREATE INDEX idx_training_assignments_training ON public.training_assignments(training_id);
CREATE INDEX idx_training_assignments_user ON public.training_assignments(user_id);
CREATE INDEX idx_training_assignments_status ON public.training_assignments(status);
