import { createClient } from "@/lib/supabase/client";

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'manager' | 'supervisor' | 'technician' | 'auditor';
    created_at: string;
}

export async function getProfiles(role?: string) {
    const supabase = createClient();
    let query = supabase
        .from("profiles")
        .select("*")
        .order("full_name");

    if (role) {
        query = query.eq("role", role);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Profile[];
}

export async function getProfileById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;
    return data as Profile;
}

export async function updateProfile(id: string, updates: Partial<Profile>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as Profile;
}
