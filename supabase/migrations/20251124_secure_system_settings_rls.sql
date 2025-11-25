-- Secure RLS for system_settings (Role-Based)
-- Date: 2025-11-24

-- Drop previous permissive policies
DROP POLICY IF EXISTS "Authenticated users can write system_settings" ON system_settings;
DROP POLICY IF EXISTS "Authenticated users can read system_settings" ON system_settings;

-- Allow read access to all authenticated users (needed for app configuration)
CREATE POLICY "Authenticated users can read system_settings"
    ON system_settings FOR SELECT
    TO authenticated
    USING (true);

-- Allow write access only to admins and managers
CREATE POLICY "Admins and Managers can manage system_settings"
    ON system_settings FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );
