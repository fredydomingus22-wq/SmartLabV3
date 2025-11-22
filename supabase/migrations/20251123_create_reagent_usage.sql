-- Migration: Create Reagent Usage Log Table
-- Track all reagent consumption with full traceability

CREATE TABLE IF NOT EXISTS public.reagent_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What was used
    reagent_id UUID NOT NULL REFERENCES public.reagents(id) ON DELETE RESTRICT,
    batch_id UUID REFERENCES public.reagent_batches(id) ON DELETE SET NULL,
    
    -- How much
    quantity_used NUMERIC NOT NULL CHECK (quantity_used > 0),
    unit TEXT NOT NULL,
    
    -- Context
    usage_type TEXT NOT NULL CHECK (usage_type IN ('analysis', 'preparation', 'calibration', 'cleaning', 'waste', 'other')),
    related_sample_id UUID, -- Link to sample if applicable
    related_analysis_id UUID, -- Link to lab_analysis if applicable
    
    -- Who and when
    used_by UUID REFERENCES public.profiles(id),
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Notes
    purpose TEXT,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_reagent_usage_reagent ON public.reagent_usage(reagent_id);
CREATE INDEX idx_reagent_usage_batch ON public.reagent_usage(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX idx_reagent_usage_used_at ON public.reagent_usage(used_at);
CREATE INDEX idx_reagent_usage_used_by ON public.reagent_usage(used_by) WHERE used_by IS NOT NULL;
CREATE INDEX idx_reagent_usage_type ON public.reagent_usage(usage_type);

-- Enable RLS
ALTER TABLE public.reagent_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone authenticated can read
CREATE POLICY "reagent_usage_read_all"
ON public.reagent_usage
FOR SELECT
TO authenticated
USING (true);

-- RLS Policy: Techs and above can record usage
CREATE POLICY "reagent_usage_insert"
ON public.reagent_usage
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'manager', 'supervisor', 'technician')
    )
);

-- RLS Policy: Only admins can update/delete (corrections)
CREATE POLICY "reagent_usage_modify_admin"
ON public.reagent_usage
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'manager')
    )
);
