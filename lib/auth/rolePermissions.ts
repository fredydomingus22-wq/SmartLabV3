// lib/auth/rolePermissions.ts
// Mapping of user roles to the sidebar groups they are allowed to see.
// This follows the Modules definition and the UX requirement for role‑based UI.

// All available sidebar group IDs
const ALL_GROUPS = [
    'production',
    'materials',
    'supply-chain',
    'laboratory',
    'analytics',
    'quality-safety',
    'system',
];

export const rolePermissions: Record<string, string[]> = {
    // Admin has FULL ACCESS to ALL modules (no restrictions)
    admin: ALL_GROUPS,

    // Manager (executive) sees all modules
    manager: ALL_GROUPS,

    // Supervisor sees production, analytics and quality modules.
    supervisor: [
        'production',
        'materials',
        'supply-chain',
        'laboratory',
        'analytics',
        'quality-safety',
        'system',
    ],

    // Technician can access operational modules only.
    technician: [
        'production',
        'materials',
        'laboratory',
        'quality-safety',
        'system',
    ],

    // Auditor has read-only view access
    auditor: [
        'production',
        'materials',
        'laboratory',
        'quality-safety',
        'system',
    ],
};

// Special function to check if user is admin (full bypass)
export function isAdminRole(role: string | null): boolean {
    return role === 'admin';
}
