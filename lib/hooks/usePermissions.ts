/**
 * RBAC Permissions Hook
 * 
 * Provides role-based permission checking throughout the application
 * Based on Epic 5 - RBAC Implementation
 * 
 * Role Permissions:
 * - Technician: Register samples, execute/validate analyses
 * - QC Manager: Create/edit/close lots, edit specs, approve releases
 * - Supervisor: Validate analyses (second signature), view all reports
 * - Admin: System configuration only
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { createClient } from '@/lib/supabase/client';

export type UserRole = 'admin' | 'manager' | 'supervisor' | 'technician' | 'auditor';

export interface Permissions {
    // Lot Management (Epic 1)
    canCreateLot: boolean;
    canEditLot: boolean;
    canCloseLot: boolean;
    canDeleteLot: boolean;

    // Sample Management (Epic 2)
    canRegisterSample: boolean;
    canEditSample: boolean;
    canDeleteSample: boolean;

    // Analysis Execution (Epic 3)
    canExecuteAnalysis: boolean;
    canValidateAnalysis: boolean;
    canRepeatAnalysis: boolean;
    canEditLockedAnalysis: boolean;

    // Specifications (Epic 4)
    canCreateSpecs: boolean;
    canEditSpecs: boolean;
    canDeleteSpecs: boolean;

    // Quality Management
    canCreateNC: boolean;
    canApproveNC: boolean;
    canCloseNC: boolean;

    // Reports & Analytics
    canViewReports: boolean;
    canExportReports: boolean;

    // System Administration
    canManageUsers: boolean;
    canConfigureSystem: boolean;
    canAccessAuditLogs: boolean;

    // Release Management
    canReleaseLot: boolean;
    canBlockLot: boolean;
}

/**
 * Main permissions hook
 * Returns user role and permission flags
 */
export function usePermissions(): {
    role: UserRole | null;
    permissions: Permissions;
    isLoading: boolean;
    hasPermission: (permission: keyof Permissions) => boolean;
    hasAnyPermission: (permissions: (keyof Permissions)[]) => boolean;
    hasAllPermissions: (permissions: (keyof Permissions)[]) => boolean;
} {
    const { user, loading } = useAuth();
    const [role, setRole] = useState<UserRole | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    // Load user profile to get role
    useEffect(() => {
        async function loadProfile() {
            if (!user) {
                setRole(null);
                setProfileLoading(false);
                return;
            }

            const supabase = createClient();
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            setRole((profile?.role as UserRole) || null);
            setProfileLoading(false);
        }

        loadProfile();
    }, [user]);

    const isLoading = loading || profileLoading;

    // Define permissions based on role
    const permissions: Permissions = getPermissionsForRole(role);

    return {
        role,
        permissions,
        isLoading,
        hasPermission: (permission: keyof Permissions) => permissions[permission],
        hasAnyPermission: (perms: (keyof Permissions)[]) =>
            perms.some(p => permissions[p]),
        hasAllPermissions: (perms: (keyof Permissions)[]) =>
            perms.every(p => permissions[p]),
    };
}

/**
 * Returns permission object for a given role
 */
function getPermissionsForRole(role: UserRole | null): Permissions {
    // No permissions if not logged in
    if (!role) {
        return createPermissions({});
    }

    switch (role) {
        case 'admin':
            return createPermissions({
                // Admin: System config only, no operational access
                canManageUsers: true,
                canConfigureSystem: true,
                canAccessAuditLogs: true,
                canViewReports: true,
                canExportReports: true,
            });

        case 'manager':
            return createPermissions({
                // QC Manager: Lot management, specs, approvals - NO execution
                canCreateLot: true,
                canEditLot: true,
                canCloseLot: true,
                canDeleteLot: true,

                canCreateSpecs: true,
                canEditSpecs: true,
                canDeleteSpecs: true,

                canCreateNC: true,
                canApproveNC: true,
                canCloseNC: true,

                canReleaseLot: true,
                canBlockLot: true,

                canViewReports: true,
                canExportReports: true,
                canAccessAuditLogs: true,

                // CANNOT execute/validate analyses (operation only)
                canExecuteAnalysis: false,
                canValidateAnalysis: false,
            });

        case 'supervisor':
            return createPermissions({
                // Supervisor: Second signature, all viewing rights
                canValidateAnalysis: true, // Second signature capability
                canRepeatAnalysis: true,

                canViewReports: true,
                canExportReports: true,
                canAccessAuditLogs: true,

                canCreateNC: true,
                canApproveNC: true,

                // Limited lot management
                canEditLot: true,
                canCloseLot: true,
            });

        case 'technician':
            return createPermissions({
                // Technician: Samples, analysis execution - NO lot management
                canRegisterSample: true,
                canEditSample: true,

                canExecuteAnalysis: true,
                canValidateAnalysis: true, // First signature
                canRepeatAnalysis: true,

                canCreateNC: true, // Can report NCs

                canViewReports: true, // Limited to own data

                // CANNOT manage lots or specs
                canCreateLot: false,
                canEditLot: false,
                canCloseLot: false,
                canCreateSpecs: false,
                canEditSpecs: false,
            });

        case 'auditor':
            return createPermissions({
                // Auditor: Read-only access to everything
                canViewReports: true,
                canExportReports: true,
                canAccessAuditLogs: true,

                // No write permissions
            });

        default:
            return createPermissions({});
    }
}

/**
 * Helper to create permissions object with defaults
 */
function createPermissions(overrides: Partial<Permissions>): Permissions {
    const defaults: Permissions = {
        canCreateLot: false,
        canEditLot: false,
        canCloseLot: false,
        canDeleteLot: false,

        canRegisterSample: false,
        canEditSample: false,
        canDeleteSample: false,

        canExecuteAnalysis: false,
        canValidateAnalysis: false,
        canRepeatAnalysis: false,
        canEditLockedAnalysis: false,

        canCreateSpecs: false,
        canEditSpecs: false,
        canDeleteSpecs: false,

        canCreateNC: false,
        canApproveNC: false,
        canCloseNC: false,

        canViewReports: false,
        canExportReports: false,

        canManageUsers: false,
        canConfigureSystem: false,
        canAccessAuditLogs: false,

        canReleaseLot: false,
        canBlockLot: false,
    };

    return { ...defaults, ...overrides };
}

/**
 * Higher-order component permission check
 * Usage: if (!canPerformAction('canCreateLot', role)) return <PermissionDenied />
 */
export function canPerformAction(
    permission: keyof Permissions,
    role: UserRole | null
): boolean {
    const permissions = getPermissionsForRole(role);
    return permissions[permission];
}

/**
 * Get user-friendly role name
 */
export function getRoleName(role: UserRole | null): string {
    switch (role) {
        case 'admin':
            return 'Administrator';
        case 'manager':
            return 'QC Manager';
        case 'supervisor':
            return 'Supervisor';
        case 'technician':
            return 'Technician';
        case 'auditor':
            return 'Auditor';
        default:
            return 'Unknown';
    }
}
