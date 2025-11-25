// lib/auth/role.ts
// Helper hook to retrieve the current user's role from Supabase auth.
// The role is stored in the `role` column of the `users` table (as defined in the
// Access Control module). This hook abstracts the logic so UI components can
// simply call `useCurrentRole()`.

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/**
 * Returns the role of the logged‑in user (e.g. "technician", "supervisor",
 * "manager", "admin"). If no user is logged in, returns `null`.
 */
export function useCurrentRole() {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        // Get the current session and fetch the role from the profile table.
        const fetchRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setRole(null);
                return;
            }
            // Assume there is a `profiles` table with a `role` column linked to the user.
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            if (error) {
                console.error('Failed to fetch role:', error);
                setRole(null);
                return;
            }
            setRole(data.role as string);
        };

        fetchRole();
        // Listen to auth state changes to keep role up‑to‑date.
        const { data: authListener } = supabase.auth.onAuthStateChange(() => {
            fetchRole();
        });
        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    return role;
}
