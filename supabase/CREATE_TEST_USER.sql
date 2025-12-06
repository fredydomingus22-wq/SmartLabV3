-- ============================================================================
-- CREATE TEST SUPERVISOR USER
-- ============================================================================
-- Este script deve ser executado no Supabase Dashboard > SQL Editor
-- ou você pode criar o utilizador via Supabase Dashboard > Authentication > Users

-- OPÇÃO 1: Via Supabase Dashboard UI (RECOMENDADO)
-- 1. Ir para: https://supabase.com/dashboard/project/xvkcxsgdxzlacrlhawlq/auth/users
-- 2. Clicar em "Add user" > "Create new user"
-- 3. Email: fredyus29@gmail.com
-- 4. Password: 123456
-- 5. Auto Confirm User: YES (importante!)

-- OPÇÃO 2: Depois de criar o user no Dashboard, executar este SQL para criar o perfil:

-- Step 1: Get the user_id from auth.users
-- SELECT id FROM auth.users WHERE email = 'fredyus29@gmail.com';

-- Step 2: Create profile (substitua USER_ID_AQUI pelo ID retornado acima)
/*
INSERT INTO profiles (id, email, role, full_name)
VALUES (
    'USER_ID_AQUI'::uuid,
    'fredyus29@gmail.com',
    'supervisor',
    'Supervisor Teste'
);
*/

-- Step 3: Get tenant_id (assumindo que você quer associar ao primeiro tenant)
-- SELECT id FROM tenants LIMIT 1;

-- Step 4: Create tenant membership (substitua USER_ID e TENANT_ID)
/*
INSERT INTO tenant_members (user_id, tenant_id, role)
VALUES (
    'USER_ID_AQUI'::uuid,
    'TENANT_ID_AQUI'::uuid,
    'member'
);
*/

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verificar se o user foi criado
SELECT 
    u.id,
    u.email,
    u.created_at,
    p.role,
    p.full_name
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'fredyus29@gmail.com';

-- Verificar tenant membership
SELECT 
    tm.user_id,
    tm.tenant_id,
    tm.role,
    t.name as tenant_name
FROM tenant_members tm
JOIN tenants t ON t.id = tm.tenant_id
WHERE tm.user_id IN (SELECT id FROM auth.users WHERE email = 'fredyus29@gmail.com');
