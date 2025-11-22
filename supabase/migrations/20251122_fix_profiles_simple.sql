-- Simple script to fix profiles and insert user
-- Run this directly in Supabase SQL Editor

-- Step 1: Check current structure
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles';

-- Step 2: Drop ALL existing policies (using CASCADE)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles CASCADE;

-- Step 3: Create simple policies
CREATE POLICY "authenticated_read_all_profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "users_update_own_profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Step 4: Insert/Update your profile (simple version without updated_at)
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
    role = EXCLUDED.role;

-- Step 5: Verify
SELECT id, email, full_name, role, created_at 
FROM public.profiles 
WHERE id = 'e7654e25-768d-459c-9a0e-f76fce62da08';
