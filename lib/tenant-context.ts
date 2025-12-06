'use server';

import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Explicit types for query results
type TenantMemberRow = Database['public']['Tables']['tenant_members']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type FactoryRow = Database['public']['Tables']['factories']['Row'];

export interface TenantContext {
    supabase: SupabaseClient<Database>;
    userId: string;
    tenantId: string;
    factoryId: string | null;
    role: string;
}

/**
 * Creates a tenant-safe Supabase client with automatic tenant isolation
 * @throws Error if user is not authenticated or has no tenant membership
 */
export async function createTenantSafeClient(): Promise<TenantContext> {
    const supabase = createClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error('Unauthorized: User not authenticated');
    }

    // Get tenant membership (simplified query without join)
    const { data: membershipData, error: membershipError } = await supabase
        .from('tenant_members')
        .select('tenant_id, role')
        .eq('user_id', user.id)
        .single();

    if (membershipError || !membershipData) {
        throw new Error('No tenant membership found for user');
    }

    // Cast to explicit type
    const membership = membershipData as unknown as Pick<TenantMemberRow, 'tenant_id' | 'role'>;

    // Get user profile for role
    const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // Cast to explicit type
    const profile = profileData as unknown as Pick<ProfileRow, 'role'> | null;

    // Get default factory (optional)
    const { data: factoryData } = await supabase
        .from('factories')
        .select('id')
        .eq('tenant_id', membership.tenant_id)
        .limit(1)
        .single();

    // Cast to explicit type
    const factory = factoryData as unknown as Pick<FactoryRow, 'id'> | null;

    return {
        supabase,
        userId: user.id,
        tenantId: membership.tenant_id,
        factoryId: factory?.id || null,
        role: profile?.role || 'member'
    };
}

/**
 * Get only the tenant ID for the current user
 */
export async function getCurrentTenantId(): Promise<string> {
    const { tenantId } = await createTenantSafeClient();
    return tenantId;
}

/**
 * Get factory ID for current user
 */
export async function getCurrentFactoryId(): Promise<string | null> {
    const { factoryId } = await createTenantSafeClient();
    return factoryId;
}
