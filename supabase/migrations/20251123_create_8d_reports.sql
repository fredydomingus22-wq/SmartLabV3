-- Migration: Create 8D Reports Table
-- Linked to NC (Non-Conformities) for root cause analysis

-- Create 8D Reports table
CREATE TABLE IF NOT EXISTS public.eight_d_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nc_id UUID NOT NULL REFERENCES public.nc(id) ON DELETE CASCADE,
    
    -- 8D Steps (8 Disciplines methodology)
    d0_preparation TEXT, -- Prepare and emergency response actions
    d1_team TEXT[], -- Team members (array of profile UUIDs as text)
    d2_problem_description TEXT, -- Describe the problem in detail
    d3_interim_actions TEXT, -- Interim containment actions taken
    d4_root_cause TEXT, -- Root cause analysis findings
    d5_permanent_actions TEXT, -- Permanent corrective actions planned
    d6_implementation TEXT, -- Implementation and validation details
    d7_prevention TEXT, -- Prevent recurrence - systemic changes
    d8_recognition TEXT, -- Recognize team contributions
    
    -- Status tracking
    current_step INTEGER DEFAULT 0 CHECK (current_step >= 0 AND current_step <= 8),
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    
    -- Metadata
    created_by UUID REFERENCES public.profiles(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_8d_nc_id ON public.eight_d_reports(nc_id);
CREATE INDEX idx_8d_status ON public.eight_d_reports(status);
CREATE INDEX idx_8d_current_step ON public.eight_d_reports(current_step);

-- Enable RLS
ALTER TABLE public.eight_d_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone authenticated can read
CREATE POLICY "8d_read_all"
ON public.eight_d_reports
FOR SELECT
TO authenticated
USING (true);

-- RLS Policy: Only admin/manager/supervisor can write
CREATE POLICY "8d_write_admin"
ON public.eight_d_reports
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'manager', 'supervisor')
    )
);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_8d_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_8d_updated_at
BEFORE UPDATE ON public.eight_d_reports
FOR EACH ROW
EXECUTE FUNCTION update_8d_updated_at();
