import { createClient } from '@/lib/supabase/client';
import { logAction } from './audit';

// Role hierarchy
export type Role = 'admin' | 'manager' | 'supervisor' | 'technician' | 'auditor';

// Permission matrix - defines what each role can do
const rolePermissions: Record<Role, string[]> = {
    admin: ['*'], // All permissions
    manager: [
        'view_all',
        'edit_all',
        'approve_nc',
        'approve_8d',
        'close_nc',
        'manage_users',
        'manage_specifications',
        'approve_samples',
        'manage_parameters',
        'view_audit_logs',
        'export_data'
    ],
    supervisor: [
        'view_all',
        'edit_own',
        'approve_limited',
        'create_nc',
        'investigate_nc',
        'approve_samples',
        'view_reports'
    ],
    technician: [
        'view_own',
        'edit_own',
        'submit',
        'create_samples',
        'enter_results',
        'create_nc',
        'view_own_reports'
    ],
    auditor: [
        'view_all',
        'audit',
        'view_audit_logs',
        'export_compliance_reports'
    ]
};

/**
 * Check if current user has a specific permission
 * @param permission - Permission string to check
 * @returns true if user has permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile) return false;

    const permissions = rolePermissions[profile.role as Role];

    // Admin has all permissions
    if (permissions.includes('*')) return true;

    // Check specific permission
    return permissions.includes(permission);
}

/**
 * Check if current user has required role (legacy - prefer hasPermission)
 * @param requiredRole - Role required
 * @returns true if user has role or higher
 */
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

    // Admin has all permissions
    if (profile.role === 'admin') return true;

    // Check exact role match
    return requiredRole === profile.role;
}

/**
 * Check if user has one of multiple required roles
 * @param requiredRoles - Array of acceptable roles
 * @returns true if user has any of the roles
 */
export async function hasAnyRole(requiredRoles: Role[]): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile) return false;

    // Admin always has access
    if (profile.role === 'admin') return true;

    return requiredRoles.includes(profile.role as Role);
}

/**
 * Get current user's role
 * @returns Current user role or null
 */
export async function getCurrentUserRole(): Promise<Role | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return profile?.role as Role || null;
}

/**
 * Get all permissions for current user
 * @returns Array of permission strings
 */
export async function getUserPermissions(): Promise<string[]> {
    const role = await getCurrentUserRole();
    if (!role) return [];

    return rolePermissions[role];
}

/**
 * Application-level audit logging with RBAC context
 * This should be called for critical operations not captured by database triggers
 * 
 * @param action - Action description
 * @param entityType - Entity type affected
 * @param entityId - Entity ID
 * @param details - Additional details
 */
export async function logAudit(
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, any>
): Promise<void> {
    await logAction(action, entityType, entityId, details);
}

/**
 * Middleware helper - throws error if permission not granted
 * Use in API routes and server actions
 * 
 * @param permission - Required permission
 * @throws Error if permission denied
 */
export async function requirePermission(permission: string): Promise<void> {
    const hasAccess = await hasPermission(permission);

    if (!hasAccess) {
        const role = await getCurrentUserRole();
        throw new Error(`Permission denied: '${permission}' required. Current role: ${role}`);
    }
}

/**
 * Middleware helper - throws error if role not granted
 * Use in API routes and server actions
 * 
 * @param requiredRoles - Required roles (any of)
 * @throws Error if permission denied
 */
export async function requireRole(requiredRoles: Role | Role[]): Promise<void> {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const hasAccess = await hasAnyRole(roles);

    if (!hasAccess) {
        const role = await getCurrentUserRole();
        throw new Error(
            `Access denied: One of [${roles.join(', ')}] required. Current role: ${role}`
        );
    }
}

