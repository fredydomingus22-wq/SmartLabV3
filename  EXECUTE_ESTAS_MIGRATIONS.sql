-- ============================================================================
-- EXECUTE ESTAS MIGRATIONS NO SUPABASE SQL EDITOR
-- ============================================================================

-- Migration 1: Adicionar production_lot_id
-- Este campo é necessário para corrigir o erro de foreign key
-- para amostras de produtos acabados

ALTER TABLE samples
ADD COLUMN IF NOT EXISTS production_lot_id UUID REFERENCES production_lots(id);

CREATE INDEX IF NOT EXISTS idx_samples_production_lot ON samples(production_lot_id);

COMMENT ON COLUMN samples.production_lot_id IS 'Link to production lot for finished products';

-- Migration 2: Adicionar sample_type
-- Este campo categoriza o tipo de amostra (produto, swab, água, etc)

ALTER TABLE samples
ADD COLUMN IF NOT EXISTS sample_type TEXT DEFAULT 'finished_product'
CHECK (sample_type IN (
    'environmental_swab',
    'finished_product', 
    'intermediate_product',
    'raw_material',
    'water_sample',
    'equipment_swab',
    'personnel_swab',
    'air_sample',
    'other'
));

CREATE INDEX IF NOT EXISTS idx_samples_sample_type ON samples(sample_type);

COMMENT ON COLUMN samples.sample_type IS 'Type of sample: environmental_swab, finished_product, intermediate_product, raw_material, water_sample, equipment_swab, personnel_swab, air_sample, other';

-- ============================================================================
-- VERIFICAÇÃO: Execute estas queries para confirmar
-- ============================================================================

-- Ver estrutura da tabela samples
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'samples'
ORDER BY ordinal_position;

-- Ver constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'samples';

-- Contar amostras por tipo (após adicionar dados)
SELECT sample_type, COUNT(*) as count
FROM samples
GROUP BY sample_type
ORDER BY count DESC;
