-- Fix profiles table RLS and insert user data
-- User ID: e7654e25-768d-459c-9a0e-f76fce62da08

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create simple policy to allow authenticated users to read all profiles
CREATE POLICY "Allow authenticated users to read profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow users to update their own profile
CREATE POLICY "Allow users to update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Insert your specific profile (replace if exists)
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
    'e7654e25-768d-459c-9a0e-f76fce62da08'::uuid,
    'domingos.a.cambongo1@gmail.com',
    'Domingos Cambongo',
    'admin'
)
ON CONFLICT (id) 
DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();

-- Verify the insert worked
SELECT id, email, full_name, role FROM public.profiles WHERE id = 'e7654e25-768d-459c-9a0e-f76fce62da08';
