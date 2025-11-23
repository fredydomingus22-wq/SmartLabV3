-- Migration: Add lifecycle tracking fields to intermediate_lots
-- Version: 2024-11-23-001

ALTER TABLE intermediate_lots
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'em_producao' CHECK (status IN ('em_producao', 'terminado', 'consumido')),
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS consumed_at TIMESTAMPTZ;

-- Add index for filtering by status and production_lot
CREATE INDEX IF NOT EXISTS idx_intermediate_lots_status ON intermediate_lots(status);
CREATE INDEX IF NOT EXISTS idx_intermediate_lots_production_lot ON intermediate_lots(production_lot_id);

-- Add comment for documentation
COMMENT ON COLUMN intermediate_lots.status IS 'Lifecycle status: em_producao (in production), terminado (completed), consumido (consumed)';
COMMENT ON COLUMN intermediate_lots.started_at IS 'Timestamp when tank entered production line';
COMMENT ON COLUMN intermediate_lots.completed_at IS 'Timestamp when preparation was completed';
COMMENT ON COLUMN intermediate_lots.consumed_at IS 'Timestamp when batch was fully consumed';
