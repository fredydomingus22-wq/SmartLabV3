-- Migration: Create Reagent Stock Movements Table
-- Track all reagent inventory movements (entries, withdrawals, returns, adjustments)

CREATE TABLE IF NOT EXISTS public.reagent_stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What moved
    reagent_id UUID NOT NULL REFERENCES public.reagents(id) ON DELETE RESTRICT,
    batch_id UUID REFERENCES public.reagent_batches(id) ON DELETE SET NULL,
    
    -- Movement details
    movement_type TEXT NOT NULL CHECK (movement_type IN ('entry', 'withdrawal', 'return', 'adjustment', 'waste', 'transfer')),
    quantity NUMERIC(10,3) NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    
    -- Entry details (for 'entry' type)
    supplier_name TEXT, -- Who provided
    purchase_order TEXT,
    invoice_number TEXT,
    cost NUMERIC,
    
    -- Withdrawal details (for 'withdrawal' type)
    requisition_number TEXT, -- Internal requisition number
    requester_id UUID REFERENCES public.profiles(id), -- Who requested
    department TEXT, -- Which department/lab
    purpose TEXT, -- Why was it requested
    
    -- Return details (for 'return' type)
    returned_quantity NUMERIC,
    return_reason TEXT,
    
    -- Locations
    from_location TEXT,
    to_location TEXT,
    
    -- Status
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'approved', 'completed', 'cancelled')),
    
    -- Approval workflow
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Who and when
    performed_by UUID REFERENCES public.profiles(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reagent_stock_movements_reagent ON public.reagent_stock_movements(reagent_id);
CREATE INDEX idx_reagent_stock_movements_batch ON public.reagent_stock_movements(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX idx_reagent_stock_movements_type ON public.reagent_stock_movements(movement_type);
CREATE INDEX idx_reagent_stock_movements_requester ON public.reagent_stock_movements(requester_id) WHERE requester_id IS NOT NULL;
CREATE INDEX idx_reagent_stock_movements_performed_at ON public.reagent_stock_movements(performed_at);
CREATE INDEX idx_reagent_stock_movements_status ON public.reagent_stock_movements(status);

-- Enable RLS
ALTER TABLE public.reagent_stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone authenticated can read
CREATE POLICY "reagent_stock_movements_read_all"
ON public.reagent_stock_movements
FOR SELECT
TO authenticated
USING (true);

-- RLS Policy: Techs and above can create movements
CREATE POLICY "reagent_stock_movements_insert"
ON public.reagent_stock_movements
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
CREATE POLICY "reagent_stock_movements_update"
ON public.reagent_stock_movements
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'manager')
    )
);
