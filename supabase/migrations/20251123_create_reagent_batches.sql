-- Migration: Create Reagent Batches Table
-- Track individual batches/lots with expiration dates and QC status

CREATE TABLE IF NOT EXISTS public.reagent_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reagent_id UUID NOT NULL REFERENCES public.reagents(id) ON DELETE CASCADE,
    
    -- Batch Info
    batch_number TEXT NOT NULL,
    lot_number TEXT,
    
    -- Receipt
    received_date DATE NOT NULL DEFAULT CURRENT_DATE,
    received_quantity NUMERIC NOT NULL CHECK (received_quantity > 0),
    received_by UUID REFERENCES public.profiles(id),
    
    -- Expiration
    manufacture_date DATE,
    expiration_date DATE,
    opened_date DATE, -- When container was first opened
    
    -- Stock
    quantity_remaining NUMERIC NOT NULL CHECK (quantity_remaining >= 0),
    unit TEXT NOT NULL,
    
    -- Quality Control
    qc_status TEXT DEFAULT 'pending' CHECK (qc_status IN ('pending', 'approved', 'rejected', 'expired')),
    qc_tested_by UUID REFERENCES public.profiles(id),
    qc_tested_at TIMESTAMP WITH TIME ZONE,
    qc_notes TEXT,
    
    -- Traceability
    purchase_order TEXT,
    invoice_number TEXT,
    cost NUMERIC CHECK (cost >= 0),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(reagent_id, batch_number)
);

-- Indexes for performance
CREATE INDEX idx_reagent_batches_reagent ON public.reagent_batches(reagent_id);
CREATE INDEX idx_reagent_batches_expiration ON public.reagent_batches(expiration_date) WHERE expiration_date IS NOT NULL;
CREATE INDEX idx_reagent_batches_qc_status ON public.reagent_batches(qc_status);
CREATE INDEX idx_reagent_batches_received_date ON public.reagent_batches(received_date);

-- Enable RLS
ALTER TABLE public.reagent_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone authenticated can read
CREATE POLICY "reagent_batches_read_all"
ON public.reagent_batches
FOR SELECT
TO authenticated
USING (true);

-- RLS Policy: Techs and above can create batches
CREATE POLICY "reagent_batches_insert"
ON public.reagent_batches
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'manager', 'supervisor', 'technician')
    )
);

-- RLS Policy: Admins and managers can update
CREATE POLICY "reagent_batches_update"
ON public.reagent_batches
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'manager')
    )
);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reagent_batches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_reagent_batches_updated_at
BEFORE UPDATE ON public.reagent_batches
FOR EACH ROW
EXECUTE FUNCTION update_reagent_batches_updated_at();
