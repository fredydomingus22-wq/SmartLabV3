// lib/auth/rolePermissions.ts
// Mapping of user roles to the sidebar groups they are allowed to see.
// This follows the Modules definition and the UX requirement for role‑based UI.

export const rolePermissions: Record<string, string[]> = {
    // Technician can access operational modules only.
    technician: [
        'production',
        'materials',
        'laboratory',
        'quality-safety',
        'system',
    ],
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
    // Manager (executive) sees all modules plus admin settings.
    manager: [
        'production',
        'materials',
        'supply-chain',
        'laboratory',
        'analytics',
        'quality-safety',
        'system',
    ],
    // Admin (full access) – same as manager for now.
    admin: [
        'production',
        'materials',
        'supply-chain',
        'laboratory',
        'analytics',
        'quality-safety',
        'system',
    ],
};
