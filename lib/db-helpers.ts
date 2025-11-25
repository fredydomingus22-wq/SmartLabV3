/**
 * Common database helper functions for SmartLab
 * Provides reusable utilities for common Supabase operations
 */

import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        console.error('Error getting current user:', error);
        return null;
    }

    return user;
}

/**
 * Get current user's profile with role
 */
export async function getCurrentUserProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error getting user profile:', error);
        return null;
    }

    return profile;
}

/**
 * Check if current user has required role
 */
export async function hasRole(requiredRoles: string[]): Promise<boolean> {
    const profile = await getCurrentUserProfile();

    if (!profile?.role) return false;

    return requiredRoles.includes(profile.role);
}

/**
 * Log audit trail
 */
export async function logAudit(params: {
    action: string;
    entity_type: string;
    entity_id?: string;
    details?: Record<string, any>;
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
        .from('audit_logs')
        .insert({
            action: params.action,
            entity_type: params.entity_type,
            entity_id: params.entity_id,
            details: params.details,
            performed_by: user?.id,
            performed_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error logging audit:', error);
    }
}

/**
 * Get parameter by name
 */
export async function getParameterByName(name: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('parameters')
        .select('*')
        .eq('name', name)
        .single();

    if (error) {
        console.error('Error getting parameter:', error);
        return null;
    }

    return data;
}

/**
 * Check if value is within specification
 */
export function isInSpec(value: number, spec: { spec_min?: number; spec_max?: number }): boolean {
    const min = spec.spec_min ?? -Infinity;
    const max = spec.spec_max ?? Infinity;
    return value >= min && value <= max;
}

/**
 * Format lot code with proper prefix
 */
export function formatLotCode(type: 'production' | 'intermediate' | 'finished', sequence: number): string {
    const prefix = {
        production: 'PROD',
        intermediate: 'INT',
        finished: 'FIN'
    };

    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${prefix[type]}-${year}${month}${day}-${sequence.toString().padStart(4, '0')}`;
}

/**
 * Generate next lot code
 */
export async function generateNextLotCode(type: 'production' | 'intermediate' | 'finished'): Promise<string> {
    const supabase = createClient();
    const table = {
        production: 'production_lots',
        intermediate: 'intermediate_lots',
        finished: 'finished_lots'
    }[type];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

    return formatLotCode(type, (count || 0) + 1);
}

/**
 * Common error handler with user-friendly messages
 */
export function handleDatabaseError(error: any, context: string = 'Operation') {
    console.error(`${context} error:`, error);

    // Map common Postgres error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
        '23505': 'This record already exists',
        '23503': 'Cannot delete - this item is referenced by other records',
        '23502': 'Required field is missing',
        '42P01': 'Database table not found',
        'PGRST116': 'No rows found'
    };

    const code = error?.code || error?.error_code;
    return errorMessages[code] || `${context} failed. Please try again.`;
}

/**
 * Batch insert with error handling
 */
export async function batchInsert<T = any>(
    table: string,
    records: T[],
    batchSize: number = 100
): Promise<{ success: boolean; inserted: number; errors: any[] }> {
    const supabase = createClient();
    const errors: any[] = [];
    let inserted = 0;

    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const { error } = await supabase.from(table).insert(batch);

        if (error) {
            errors.push({ batch: i / batchSize, error });
        } else {
            inserted += batch.length;
        }
    }

    return {
        success: errors.length === 0,
        inserted,
        errors
    };
}
