-- Enable RLS and policies for system_settings
-- Date: 2025-11-24

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read system_settings" ON system_settings;
CREATE POLICY "Authenticated users can read system_settings"
    ON system_settings FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can write system_settings" ON system_settings;
CREATE POLICY "Authenticated users can write system_settings"
    ON system_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger to update updated_at automatically (assuming function exists)
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
