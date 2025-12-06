-- Add intermediate_lot_id to samples table
ALTER TABLE samples 
ADD COLUMN IF NOT EXISTS intermediate_lot_id UUID REFERENCES intermediate_lots(id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_samples_intermediate_lot_id ON samples(intermediate_lot_id);
