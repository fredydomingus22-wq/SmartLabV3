import { createClient } from '@/lib/supabase/client';

// Role hierarchy
export type Role = 'admin' | 'manager' | 'supervisor' | 'technician' | 'auditor';

// Permission matrix
const rolePermissions: Record<Role, string[]> = {
    admin: ['*'], // All permissions
    manager: ['view_all', 'edit_all', 'approve', 'manage_users'],
    supervisor: ['view_all', 'edit_own', 'approve_limited'],
    technician: ['view_own', 'edit_own', 'submit'],
    auditor: ['view_all', 'audit']
};

export async function checkPermission(requiredRole: Role): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile) return false;

    return requiredRole === profile.role || profile.role === 'admin';
}

export async function logAudit(
    action: string,
    entityType: string,
    entityId: string,
    details?: any
) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from('audit_logs').insert({
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        performed_by: user.id
    });
}
