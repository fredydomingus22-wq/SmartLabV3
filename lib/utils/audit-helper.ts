/**
 * Audit Trail Helper Utility
 * 
 * Centralized audit logging for all CRUD operations
 * Automatically captures before/after values, user info, and optional IP address
 * 
 * Part of Epic 6 - Audit & Traceability
 */

import { createClient } from '@/lib/supabase/client';

export type AuditAction =
    | 'created'
    | 'updated'
    | 'deleted'
    | 'validated'
    | 'approved'
    | 'rejected'
    | 'closed'
    | 'reopened';

export interface AuditLogEntry {
    tableName: string;
    recordId: string;
    action: AuditAction;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
}

/**
 * Logs an audit entry to the database
 * This function is non-blocking and handles errors gracefully
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
    const supabase = createClient();

    try {
        // Get current user if not provided
        if (!entry.userId) {
            const { data: { user } } = await supabase.auth.getUser();
            entry.userId = user?.id;
        }

        // Determine which audit table exists (audit_log vs audit_logs)
        const { data: tables } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .in('table_name', ['audit_log', 'audit_logs'])
            .limit(1)
            .single();

        const tableName = tables?.table_name || 'audit_log';

        // Prepare audit record based on table structure
        const auditRecord = tableName === 'audit_log'
            ? {
                table_name: entry.tableName,
                record_id: entry.recordId,
                action: entry.action,
                old_values: entry.oldValues,
                new_values: entry.newValues,
                user_id: entry.userId,
                ip_address: entry.ipAddress,
                user_agent: entry.userAgent,
            }
            : {
                table_name: entry.tableName,
                record_id: entry.recordId,
                action: entry.action.toUpperCase(), // audit_logs uses uppercase
                old_data: entry.oldValues,
                new_data: entry.newValues,
                user_id: entry.userId,
                ip_address: entry.ipAddress,
                user_agent: entry.userAgent,
            };

        const { error } = await supabase
            .from(tableName)
            .insert(auditRecord);

        if (error) {
            console.error('Audit log error:', error);
            // Don't throw - audit failures shouldn't break application flow
        }
    } catch (err) {
        console.error('Failed to log audit entry:', err);
        // Silent fail - audit is important but not critical for operation
    }
}

/**
 * Batch logs multiple audit entries
 * Useful for complex operations affecting multiple records
 */
export async function logAuditBatch(entries: AuditLogEntry[]): Promise<void> {
    await Promise.all(entries.map(entry => logAudit(entry)));
}

/**
 * Creates an audit log for a creation operation
 */
export function auditCreate(
    tableName: string,
    recordId: string,
    newValues: Record<string, any>,
    metadata?: Record<string, any>
): Promise<void> {
    return logAudit({
        tableName,
        recordId,
        action: 'created',
        newValues,
        metadata,
    });
}

/**
 * Creates an audit log for an update operation
 */
export function auditUpdate(
    tableName: string,
    recordId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    metadata?: Record<string, any>
): Promise<void> {
    return logAudit({
        tableName,
        recordId,
        action: 'updated',
        oldValues,
        newValues,
        metadata,
    });
}

/**
 * Creates an audit log for a deletion operation
 */
export function auditDelete(
    tableName: string,
    recordId: string,
    oldValues: Record<string, any>,
    metadata?: Record<string, any>
): Promise<void> {
    return logAudit({
        tableName,
        recordId,
        action: 'deleted',
        oldValues,
        metadata,
    });
}

/**
 * Creates an audit log for validation/approval operations
 */
export function auditValidation(
    tableName: string,
    recordId: string,
    action: 'validated' | 'approved' | 'rejected',
    validatorId: string,
    metadata?: Record<string, any>
): Promise<void> {
    return logAudit({
        tableName,
        recordId,
        action,
        userId: validatorId,
        metadata,
    });
}

/**
 * Gets IP address from request (server-side only)
 * For client-side, IP will be captured by backend
 */
export function getClientIP(request?: Request): string | undefined {
    if (!request) return undefined;

    // Try various headers for IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');
    const cloudflare = request.headers.get('cf-connecting-ip');

    return cloudflare || real || forwarded?.split(',')[0];
}

/**
 * Gets user agent from request
 */
export function getUserAgent(request?: Request): string | undefined {
    if (!request) return undefined;
    return request.headers.get('user-agent') || undefined;
}

/**
 * Computes the difference between old and new values
 * Returns only the fields that changed
 */
export function computeChanges(
    oldValues: Record<string, any>,
    newValues: Record<string, any>
): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};

    for (const key in newValues) {
        if (oldValues[key] !== newValues[key]) {
            changes[key] = {
                old: oldValues[key],
                new: newValues[key],
            };
        }
    }

    return changes;
}
