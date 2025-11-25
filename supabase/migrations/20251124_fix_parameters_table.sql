-- Fix Parameters Table: Add missing columns
-- Date: 2025-11-24

ALTER TABLE parameters 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing parameters to have a default category if needed
UPDATE parameters 
SET category = 'General' 
WHERE category IS NULL;
