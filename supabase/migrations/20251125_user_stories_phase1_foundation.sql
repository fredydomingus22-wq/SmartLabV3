-- ============================================================================
-- SMARTLAB V3 - USER STORIES FOUNDATION (Phase 1)
-- Migration: Add fields for digital signatures, lot closure validation, 
--            sample tracking, and enhanced audit logging
-- Date: 2025-11-25
-- ============================================================================

-- ============================================================================
-- 1. ENHANCE LAB_ANALYSIS TABLE (Epic 3 - Analysis Execution)
-- ============================================================================

-- Add digital signature validation fields
ALTER TABLE public.lab_analysis
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES public.technicians(id),
  ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS parent_analysis_id UUID REFERENCES public.lab_analysis(id);

-- Add comments for clarity
COMMENT ON COLUMN public.lab_analysis.is_locked IS 'Prevents editing after digital signature validation';
COMMENT ON COLUMN public.lab_analysis.validated_by IS 'Technician who validated the analysis with digital signature';
COMMENT ON COLUMN public.lab_analysis.validated_at IS 'Timestamp when analysis was validated';
COMMENT ON COLUMN public.lab_analysis.parent_analysis_id IS 'Links to original analysis for repeat analyses';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_lab_analysis_validated_by ON public.lab_analysis(validated_by);
CREATE INDEX IF NOT EXISTS idx_lab_analysis_parent ON public.lab_analysis(parent_analysis_id);

-- ============================================================================
-- 2. ENHANCE SAMPLES TABLE (Epic 2 - Sample Registration)
-- ============================================================================

-- Add tank reference and phase information for sample code generation
ALTER TABLE public.samples
  ADD COLUMN IF NOT EXISTS tank_id UUID,
  ADD COLUMN IF NOT EXISTS phase TEXT CHECK (phase IN ('intermediate', 'finished')),
  ADD COLUMN IF NOT EXISTS sequence_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS intermediate_lot_id UUID REFERENCES public.intermediate_lots(id),
  ADD COLUMN IF NOT EXISTS finished_lot_id UUID REFERENCES public.finished_lots(id);

-- Add comments
COMMENT ON COLUMN public.samples.tank_id IS 'Reference to mixing tank for sample location';
COMMENT ON COLUMN public.samples.phase IS 'Sample phase: intermediate (tank) or finished (line)';
COMMENT ON COLUMN public.samples.sequence_number IS 'Sequential number per tank per day for code generation';
COMMENT ON COLUMN public.samples.intermediate_lot_id IS 'Link to intermediate lot if applicable';
COMMENT ON COLUMN public.samples.finished_lot_id IS 'Link to finished lot if applicable';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_samples_tank ON public.samples(tank_id);
CREATE INDEX IF NOT EXISTS idx_samples_phase ON public.samples(phase);
CREATE INDEX IF NOT EXISTS idx_samples_intermediate_lot ON public.samples(intermediate_lot_id);
CREATE INDEX IF NOT EXISTS idx_samples_finished_lot ON public.samples(finished_lot_id);

-- ============================================================================
-- 3. ENHANCE SPECIFICATIONS TABLE (Epic 4 - Specifications Management)
-- ============================================================================

-- Add phase association to specifications
ALTER TABLE public.specifications
  ADD COLUMN IF NOT EXISTS phase TEXT CHECK (phase IN ('intermediate', 'finished', 'both')) DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS analytical_method TEXT,
  ADD COLUMN IF NOT EXISTS frequency TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS effective_until TIMESTAMP WITH TIME ZONE;

-- Add comments
COMMENT ON COLUMN public.specifications.phase IS 'Which phase this specification applies to';
COMMENT ON COLUMN public.specifications.analytical_method IS 'Official method reference (e.g., AOAC 942.15)';
COMMENT ON COLUMN public.specifications.frequency IS 'Required testing frequency';
COMMENT ON COLUMN public.specifications.is_active IS 'Only active specs are used for new analyses';
COMMENT ON COLUMN public.specifications.effective_from IS 'When this specification becomes valid';
COMMENT ON COLUMN public.specifications.effective_until IS 'When this specification expires (NULL = no expiry)';

-- Create index for active specifications
CREATE INDEX IF NOT EXISTS idx_specifications_phase ON public.specifications(phase);
CREATE INDEX IF NOT EXISTS idx_specifications_active ON public.specifications(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 4. ENHANCE PRODUCTION_LOTS TABLE (Epic 1 - Lot Management)
-- ============================================================================

-- Add more status options and closure tracking
ALTER TABLE public.production_lots
  DROP CONSTRAINT IF EXISTS production_lots_status_check,
  ADD CONSTRAINT production_lots_status_check 
    CHECK (status IN ('aguardando_ordem', 'em_espera', 'em_producao', 'concluido', 'encerrado', 'bloqueado'));

-- Add closure validation fields
ALTER TABLE public.production_lots
  ADD COLUMN IF NOT EXISTS closed_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS closure_notes TEXT;

-- Add comments
COMMENT ON COLUMN public.production_lots.closed_by IS 'QC Manager who closed the lot';
COMMENT ON COLUMN public.production_lots.closed_at IS 'Timestamp when lot was closed';
COMMENT ON COLUMN public.production_lots.closure_notes IS 'Notes added during lot closure';

-- ============================================================================
-- 5. ENHANCE PARAMETERS TABLE (Epic 4 - Specifications Management)
-- ============================================================================

-- Add phase information to parameters
ALTER TABLE public.parameters
  ADD COLUMN IF NOT EXISTS applicable_phases TEXT[] DEFAULT ARRAY['intermediate', 'finished']::TEXT[];

-- Add comment
COMMENT ON COLUMN public.parameters.applicable_phases IS 'Array of phases where this parameter is applicable';

-- Create GIN index for array queries
CREATE INDEX IF NOT EXISTS idx_parameters_phases ON public.parameters USING GIN (applicable_phases);

-- ============================================================================
-- 6. CREATE SAMPLE_SEQUENCES TABLE (Epic 2 - Sample Code Generation)
-- ============================================================================

-- Track daily sequences per tank for sample code generation
CREATE TABLE IF NOT EXISTS public.sample_sequences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tank_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_sequence INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one sequence per tank per day
  UNIQUE(tank_id, date)
);

COMMENT ON TABLE public.sample_sequences IS 'Tracks daily sample sequence numbers per tank for code generation';

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_sample_sequences_tank_date ON public.sample_sequences(tank_id, date);

-- ============================================================================
-- 7. CREATE FUNCTION: Generate Sample Code
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_sample_code(
  p_product_id UUID,
  p_tank_id UUID,
  p_lot_code TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_product_code TEXT;
  v_lot_digits TEXT;
  v_tank_code TEXT;
  v_sequence INTEGER;
  v_sample_code TEXT;
BEGIN
  -- Get product SKU abbreviation (first 3 chars)
  SELECT LEFT(UPPER(sku), 3) INTO v_product_code
  FROM public.products
  WHERE id = p_product_id;
  
  -- Get last 4 digits of lot code
  v_lot_digits := RIGHT(p_lot_code, 4);
  
  -- Get tank identifier (assuming tank_id maps to a code like 'TK01')
  -- This would need adjustment based on your tank table structure
  v_tank_code := COALESCE(p_tank_id::TEXT, 'XX');
  
  -- Get next sequence for this tank today
  INSERT INTO public.sample_sequences (tank_id, product_id, date, last_sequence)
  VALUES (p_tank_id, p_product_id, CURRENT_DATE, 1)
  ON CONFLICT (tank_id, date)
  DO UPDATE SET 
    last_sequence = public.sample_sequences.last_sequence + 1,
    updated_at = NOW()
  RETURNING last_sequence INTO v_sequence;
  
  -- Format: [ProductCode][4digitsLot]-[Tank]-[Seq]
  -- Example: COK1234-TK01-001
  v_sample_code := FORMAT('%s%s-%s-%s',
    v_product_code,
    v_lot_digits,
    v_tank_code,
    LPAD(v_sequence::TEXT, 3, '0')
  );
  
  RETURN v_sample_code;
END;
$$;

COMMENT ON FUNCTION generate_sample_code IS 'Generates unique sample code: [ProductCode][4digitsLot]-[Tank]-[Seq]';

-- ============================================================================
-- 8. ENHANCE AUDIT_LOGS TABLE (Epic 6 - Audit Trail)
-- ============================================================================

-- Check if audit_log or audit_logs exists and enhance it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    -- Add IP address tracking
    ALTER TABLE public.audit_logs
      ADD COLUMN IF NOT EXISTS ip_address INET,
      ADD COLUMN IF NOT EXISTS user_agent TEXT;
      
    COMMENT ON COLUMN public.audit_logs.ip_address IS 'IP address of user who performed action';
    COMMENT ON COLUMN public.audit_logs.user_agent IS 'Browser user agent string';
    
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
    -- Add IP address tracking to audit_log
    ALTER TABLE public.audit_log
      ADD COLUMN IF NOT EXISTS ip_address INET,
      ADD COLUMN IF NOT EXISTS user_agent TEXT;
      
    COMMENT ON COLUMN public.audit_log.ip_address IS 'IP address of user who performed action';
    COMMENT ON COLUMN public.audit_log.user_agent IS 'Browser user agent string';
  END IF;
END $$;

-- ============================================================================
-- 9. CREATE DATABASE TRIGGERS FOR AUTO-AUDIT
-- ============================================================================

-- Function to automatically audit production lot changes
CREATE OR REPLACE FUNCTION audit_production_lot_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only log to audit_log if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
    INSERT INTO public.audit_log (
      table_name,
      record_id,
      action,
      old_values,
      new_values,
      user_id
    ) VALUES (
      'production_lots',
      COALESCE(NEW.id, OLD.id),
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'created'
        WHEN TG_OP = 'UPDATE' THEN 'updated'
        WHEN TG_OP = 'DELETE' THEN 'deleted'
      END,
      CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
      CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
      COALESCE(NEW.created_by, auth.uid())
    );
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    INSERT INTO public.audit_logs (
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      user_id
    ) VALUES (
      'production_lots',
      COALESCE(NEW.id, OLD.id),
      TG_OP,
      CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
      CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
      COALESCE(NEW.created_by, auth.uid())
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for production lots
DROP TRIGGER IF EXISTS trigger_audit_production_lots ON public.production_lots;
CREATE TRIGGER trigger_audit_production_lots
  AFTER INSERT OR UPDATE OR DELETE ON public.production_lots
  FOR EACH ROW
  EXECUTE FUNCTION audit_production_lot_changes();

-- ============================================================================
-- 10. ADD RLS POLICIES FOR NEW FIELDS
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.sample_sequences ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read sample sequences
CREATE POLICY "allow_authenticated_select_sample_sequences"
  ON public.sample_sequences FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated users to insert/update sample sequences
CREATE POLICY "allow_authenticated_write_sample_sequences"
  ON public.sample_sequences FOR ALL TO authenticated
  USING (true);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE '✅ Phase 1 Foundation Migration Complete';
  RAISE NOTICE '   - Added digital signature fields to lab_analysis';
  RAISE NOTICE '   - Enhanced samples table with phase and tank tracking';
  RAISE NOTICE '   - Added phase association to specifications';
  RAISE NOTICE '   - Enhanced production lots with closure tracking';
  RAISE NOTICE '   - Created sample_sequences table and generation function';
  RAISE NOTICE '   - Enhanced audit logging with IP tracking';
  RAISE NOTICE '   - Added auto-audit triggers for production lots';
END $$;
