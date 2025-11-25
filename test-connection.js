require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
    console.log('🔄 Iniciando teste de conexão Supabase...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Erro: Variáveis de ambiente ausentes.');
        console.log('URL:', supabaseUrl);
        console.log('KEY:', supabaseKey ? 'Presente (Oculta)' : 'Ausente');
        return;
    }

    console.log('✅ Variáveis de ambiente encontradas.');
    console.log('URL:', supabaseUrl);

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Test 1: Auth Config
        console.log('Testing Auth Config...');
        const { data: authData, error: authError } = await supabase.auth.getSession();
        if (authError) {
            console.log('⚠️ Auth Error:', authError.message);
        } else {
            console.log('✅ Auth Service Reachable');
        }

        // Test 2: Login Attempt (to check CORS/Network for POST requests)
        console.log('Testing Login Endpoint...');
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email: 'test@example.com',
            password: 'wrongpassword'
        });

        if (loginError) {
            console.log('ℹ️ Login Response:', loginError.message);
            if (loginError.message.includes('fetch')) {
                console.error('❌ NETWORK ERROR DETECTED during login!');
            } else {
                console.log('✅ Login Endpoint Reachable (Expected invalid credentials error)');
            }
        }

        // Test 3: Database Query
        console.log('Testing Database...');
        const start = Date.now();
        // Try a very simple query on a table that definitely exists or just a health check if possible
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        const end = Date.now();

        if (error) {
            console.error('❌ Database Error:', error.message);
            console.error('Details:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Database Connection Successful!');
            console.log(`⏱️ Response time: ${end - start}ms`);
        }
    } catch (err) {
        console.error('❌ Unexpected Error:', err);
    }
}

testConnection();
