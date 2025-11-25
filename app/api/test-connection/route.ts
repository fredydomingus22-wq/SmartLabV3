import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
    try {
        const supabase = createClient();

        // Test basic connection
        const { data, error } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);

        if (error) {
            return NextResponse.json({
                status: 'error',
                message: 'Failed to connect to Supabase',
                error: error.message,
                details: {
                    code: error.code,
                    hint: error.hint
                }
            }, { status: 500 });
        }

        // Test auth
        const { data: { session } } = await supabase.auth.getSession();

        return NextResponse.json({
            status: 'success',
            message: 'Supabase connection successful',
            data: {
                hasEnvVars: {
                    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                    anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                },
                database: 'connected',
                auth: session ? 'authenticated' : 'not authenticated',
                timestamp: new Date().toISOString()
            }
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: 'Unexpected error testing connection',
            error: error.message
        }, { status: 500 });
    }
}
