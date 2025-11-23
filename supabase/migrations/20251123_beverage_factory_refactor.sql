-- Migration: Beverage Factory Data Model Refactoring
-- Implements proper beverage factory hierarchy: ProductionLot → IntermediateTank → LineSample → LineAnalysis

-- ============================================================================
-- 1. RENAME intermediate_lots → intermediate_tanks
-- ============================================================================

-- Rename the table
ALTER TABLE IF EXISTS public.intermediate_lots RENAME TO intermediate_tanks;

-- Update the table with new columns
ALTER TABLE public.intermediate_tanks
  DROP COLUMN IF EXISTS ingredients,
  DROP COLUMN IF EXISTS brix,
  DROP COLUMN IF EXISTS ph,
  DROP COLUMN IF EXISTS acidity,
  ADD COLUMN IF NOT EXISTS tank_code text,
  ADD COLUMN IF NOT EXISTS syrup_name text,
  ADD COLUMN IF NOT EXISTS prepared_by text,
  ADD COLUMN IF NOT EXISTS start_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS end_at timestamp with time zone,
  ALTER COLUMN status TYPE text,
  ALTER COLUMN status SET DEFAULT 'active';

-- Update existing status values if needed
UPDATE public.intermediate_tanks 
SET status = 'active' 
WHERE status = 'pending' OR status IS NULL;

-- Add comment
COMMENT ON TABLE public.intermediate_tanks IS 'Syrup/mixing tanks for beverage production - produto intermédio';

-- ============================================================================
-- 2. CREATE line_samples table (replaces finished_lots concept)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.line_samples (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  tank_id uuid NOT NULL REFERENCES public.intermediate_tanks(id) ON DELETE CASCADE,
  production_lot_id uuid NOT NULL REFERENCES public.production_lots(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  sample_time timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  collected_by text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'oos')),
  signature_data text, -- JSON with signature image and validation
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.line_samples IS 'Final product samples collected every 30 minutes from active tanks';
COMMENT ON COLUMN public.line_samples.signature_data IS 'Technician signature with password validation';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_line_samples_tank_id ON public.line_samples(tank_id);
CREATE INDEX IF NOT EXISTS idx_line_samples_production_lot_id ON public.line_samples(production_lot_id);
CREATE INDEX IF NOT EXISTS idx_line_samples_product_id ON public.line_samples(product_id);
CREATE INDEX IF NOT EXISTS idx_line_samples_status ON public.line_samples(status);
CREATE INDEX IF NOT EXISTS idx_line_samples_sample_time ON public.line_samples(sample_time DESC);

-- ============================================================================
-- 3. CREATE line_analysis table (individual parameter measurements)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.line_analysis (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  sample_id uuid NOT NULL REFERENCES public.line_samples(id) ON DELETE CASCADE,
  parameter_id uuid NOT NULL REFERENCES public.parameters(id),
  value numeric NOT NULL,
  lsl numeric, -- Lower Spec Limit
  target numeric,
  usl numeric, -- Upper Spec Limit
  unit text,
  result_status text DEFAULT 'in_spec' CHECK (result_status IN ('in_spec', 'out_of_spec')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.line_analysis IS 'Individual parameter measurements for each line sample';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_line_analysis_sample_id ON public.line_analysis(sample_id);
CREATE INDEX IF NOT EXISTS idx_line_analysis_parameter_id ON public.line_analysis(parameter_id);
CREATE INDEX IF NOT EXISTS idx_line_analysis_result_status ON public.line_analysis(result_status);

-- ============================================================================
-- 4. RLS (Row Level Security) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE public.intermediate_tanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.line_analysis ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (from old intermediate_lots)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.intermediate_tanks;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.intermediate_tanks;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.intermediate_tanks;

-- intermediate_tanks policies
CREATE POLICY "Enable read access for all authenticated users"
  ON public.intermediate_tanks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.intermediate_tanks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON public.intermediate_tanks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- line_samples policies
CREATE POLICY "Enable read access for all authenticated users"
  ON public.line_samples FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.line_samples FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON public.line_samples FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- line_analysis policies
CREATE POLICY "Enable read access for all authenticated users"
  ON public.line_analysis FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.line_analysis FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON public.line_analysis FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 5. DEPRECATE finished_lots (optional - keep for reference but mark as deprecated)
-- ============================================================================

COMMENT ON TABLE public.finished_lots IS 'DEPRECATED - Use line_samples and line_analysis instead';

-- ============================================================================
-- 6. Add product relationship to production_lots if missing
-- ============================================================================

ALTER TABLE public.production_lots
  ADD COLUMN IF NOT EXISTS line_id text;

COMMENT ON COLUMN public.production_lots.line_id IS 'Production line identifier';
