-- Drop unused tables and cascade to remove FKs
DROP TABLE IF EXISTS public.line_analysis CASCADE;
DROP TABLE IF EXISTS public.line_samples CASCADE;
DROP TABLE IF EXISTS public.finished_lots CASCADE;
DROP TABLE IF EXISTS public.intermediate_tanks CASCADE;

-- Update non_conformities
-- Check if column exists before renaming to avoid errors if run multiple times (though this is a one-off migration)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'non_conformities' AND column_name = 'finished_lot_id') THEN
        ALTER TABLE public.non_conformities RENAME COLUMN finished_lot_id TO finished_product_lot_id;
    END IF;
END $$;

-- Clear old IDs to avoid FK violation (assuming old IDs don't match new table)
UPDATE public.non_conformities SET finished_product_lot_id = NULL;

-- Add FK if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'non_conformities_finished_product_lot_id_fkey') THEN
        ALTER TABLE public.non_conformities
        ADD CONSTRAINT non_conformities_finished_product_lot_id_fkey 
        FOREIGN KEY (finished_product_lot_id) REFERENCES public.finished_product_lots(id);
    END IF;
END $$;

-- Update spc_measurements
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'spc_measurements' AND column_name = 'finished_lot_id') THEN
        ALTER TABLE public.spc_measurements RENAME COLUMN finished_lot_id TO finished_product_lot_id;
    END IF;
END $$;

UPDATE public.spc_measurements SET finished_product_lot_id = NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'spc_measurements_finished_product_lot_id_fkey') THEN
        ALTER TABLE public.spc_measurements
        ADD CONSTRAINT spc_measurements_finished_product_lot_id_fkey
        FOREIGN KEY (finished_product_lot_id) REFERENCES public.finished_product_lots(id);
    END IF;
END $$;

-- Remove redundant columns from production_lots
ALTER TABLE public.production_lots 
DROP COLUMN IF EXISTS production_line,
DROP COLUMN IF EXISTS shift,
DROP COLUMN IF EXISTS line_id;

-- Add comments
COMMENT ON TABLE public.production_lots IS 'Core table for production lots. Links to product, factory, and holds status.';
COMMENT ON TABLE public.intermediate_lots IS 'Intermediate product lots (formerly tanks). Linked to production_lots.';
COMMENT ON TABLE public.finished_product_lots IS 'Finished product lots ready for distribution. Linked to intermediate_lots.';
