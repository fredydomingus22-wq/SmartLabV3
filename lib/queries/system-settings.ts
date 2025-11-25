// Queries for system settings (global configuration)

import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface SystemSetting {
    id: string;
    key: string;
    value: any; // stored as jsonb
    description?: string;
    updated_at: string;
    updated_by?: string;
}

// Get all settings
export async function getSystemSettings() {
    const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('key');
    return { data: data as SystemSetting[] | null, error };
}

// Create a new setting (key must be unique)
export async function createSystemSetting(setting: Partial<SystemSetting>) {
    const { data, error } = await supabase
        .from('system_settings')
        .insert(setting)
        .select()
        .single();
    return { data: data as SystemSetting | null, error };
}

// Update an existing setting by id
export async function updateSystemSetting(id: string, updates: Partial<SystemSetting>) {
    const { data, error } = await supabase
        .from('system_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    return { data: data as SystemSetting | null, error };
}

// Delete a setting
export async function deleteSystemSetting(id: string) {
    const { error } = await supabase.from('system_settings').delete().eq('id', id);
    return { error };
}
