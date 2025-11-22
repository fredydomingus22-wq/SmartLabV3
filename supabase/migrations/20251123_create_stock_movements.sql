-- Migration: Create Stock Movements Table
-- Track all inventory movements (receipts, issues, transfers, adjustments)

-- Create Stock Movements table
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What moved
    material_id UUID NOT NULL REFERENCES public.raw_materials(id) ON DELETE RESTRICT,
    lot_code TEXT, -- Optional lot tracking
    
    -- Movement details
    movement_type TEXT NOT NULL CHECK (movement_type IN ('receipt', 'issue', 'transfer', 'adjustment', 'return', 'waste')),
    quantity NUMERIC(10,3) NOT NULL CHECK (quantity != 0), -- Can be negative for issues
    unit TEXT NOT NULL DEFAULT 'kg', -- kg, L, units, etc
    
    -- Locations
    from_location TEXT,
    to_location TEXT,
    
    -- Traceability
    reference_doc TEXT, -- PO number, transfer doc, production order, etc
    notes TEXT,
    reason TEXT, -- For adjustments: explain why
    
    -- Who and when
    performed_by UUID REFERENCES public.profiles(id),
    approved_by UUID REFERENCES public.profiles(id), -- For adjustments
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_stock_movements_material ON public.stock_movements(material_id);
CREATE INDEX idx_stock_movements_type ON public.stock_movements(movement_type);
CREATE INDEX idx_stock_movements_performed_at ON public.stock_movements(performed_at);
CREATE INDEX idx_stock_movements_performed_by ON public.stock_movements(performed_by);
CREATE INDEX idx_stock_movements_lot_code ON public.stock_movements(lot_code) WHERE lot_code IS NOT NULL;

-- Enable RLS
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone authenticated can read
CREATE POLICY "stock_movements_read_all"
ON public.stock_movements
FOR SELECT
TO authenticated
USING (true);

-- RLS Policy: Techs and above can create movements
CREATE POLICY "stock_movements_insert"
ON public.stock_movements
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
CREATE POLICY "stock_movements_modify_admin"
ON public.stock_movements
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'manager')
    )
);
