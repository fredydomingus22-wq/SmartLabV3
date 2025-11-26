import { createClient } from '@/lib/supabase/client';

/**
 * Audit Trail Utilities
 * Functions for querying and managing audit logs
 * Compliance: ISO 17025, 21 CFR Part 11
 */

export interface AuditLog {
    id: string;
    table_name: string;
    record_id: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    old_data?: Record<string, any>;
    new_data?: Record<string, any>;
    changed_fields?: string[];
    changed_by?: string;
    user_email?: string;
    user_role?: string;
    changed_at: string;
    ip_address?: string;
    user_agent?: string;
    tenant_id?: string;
    factory_id?: string;
    description?: string;
    created_at: string;
}

export interface AuditTrailFilters {
    table_name?: string;
    record_id?: string;
    action?: 'INSERT' | 'UPDATE' | 'DELETE';
    changed_by?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
}

/**
 * Get audit trail for a specific record
 * @param tableName - Database table name
 * @param recordId - UUID of the record
 * @returns Array of audit log entries
 */
export async function getAuditTrail(
    tableName: string,
    recordId: string
): Promise<AuditLog[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('audit_logs')
        .select(`
            id,
            table_name,
            record_id,
            action,
            old_data,
            new_data,
            changed_fields,
            changed_by,
            user_email,
            user_role,
            changed_at,
            ip_address,
            user_agent,
            tenant_id,
            factory_id,
            description,
            created_at
        `)
        .eq('table_name', tableName)
        .eq('record_id', recordId)
        .order('changed_at', { ascending: false });

    if (error) {
        console.error('Error fetching audit trail:', error);
        throw error;
    }

    return data || [];
}

/**
 * Get recent audit activity with filters
 * @param filters - Optional filters
 * @returns Array of audit log entries
 */
export async function getAuditActivity(
    filters: AuditTrailFilters = {}
): Promise<AuditLog[]> {
    const supabase = createClient();

    let query = supabase
        .from('audit_logs')
        .select('*')
        .order('changed_at', { ascending: false });

    // Apply filters
    if (filters.table_name) {
        query = query.eq('table_name', filters.table_name);
    }
    if (filters.record_id) {
        query = query.eq('record_id', filters.record_id);
    }
    if (filters.action) {
        query = query.eq('action', filters.action);
    }
    if (filters.changed_by) {
        query = query.eq('changed_by', filters.changed_by);
    }
    if (filters.start_date) {
        query = query.gte('changed_at', filters.start_date);
    }
    if (filters.end_date) {
        query = query.lte('changed_at', filters.end_date);
    }

    // Apply limit
    query = query.limit(filters.limit || 100);

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching audit activity:', error);
        throw error;
    }

    return data || [];
}

/**
 * Get user activity history
 * @param userId - UUID of the user
 * @param limit - Maximum number of records to return
 * @returns Array of audit log entries
 */
export async function getUserActivity(
    userId: string,
    limit: number = 50
): Promise<AuditLog[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('changed_by', userId)
        .order('changed_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching user activity:', error);
        throw error;
    }

    return data || [];
}

/**
 * Export audit logs to CSV for compliance
 * @param filters - Filters to apply
 * @returns CSV string
 */
export async function exportAuditLog(
    filters: AuditTrailFilters = {}
): Promise<string> {
    const logs = await getAuditActivity({ ...filters, limit: 10000 });

    // CSV headers
    const headers = [
        'Date/Time',
        'User Email',
        'User Role',
        'Table',
        'Record ID',
        'Action',
        'Changed Fields',
        'Description',
        'IP Address'
    ];

    // Convert logs to CSV rows
    const rows = logs.map(log => [
        log.changed_at,
        log.user_email || '',
        log.user_role || '',
        log.table_name,
        log.record_id,
        log.action,
        log.changed_fields?.join(', ') || '',
        log.description || '',
        log.ip_address || ''
    ]);

    // Combine into CSV
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
}

/**
 * Get audit summary statistics
 * @param startDate - Start date for analysis
 * @param endDate - End date for analysis
 * @returns Summary statistics
 */
export async function getAuditSummary(
    startDate?: string,
    endDate?: string
): Promise<{
    total_operations: number;
    operations_by_table: Record<string, number>;
    operations_by_action: Record<string, number>;
    operations_by_user: Record<string, number>;
}> {
    const logs = await getAuditActivity({
        start_date: startDate,
        end_date: endDate,
        limit: 10000
    });

    const summary = {
        total_operations: logs.length,
        operations_by_table: {} as Record<string, number>,
        operations_by_action: {} as Record<string, number>,
        operations_by_user: {} as Record<string, number>
    };

    logs.forEach(log => {
        // By table
        summary.operations_by_table[log.table_name] =
            (summary.operations_by_table[log.table_name] || 0) + 1;

        // By action
        summary.operations_by_action[log.action] =
            (summary.operations_by_action[log.action] || 0) + 1;

        // By user
        const userKey = log.user_email || 'Unknown';
        summary.operations_by_user[userKey] =
            (summary.operations_by_user[userKey] || 0) + 1;
    });

    return summary;
}

/**
 * Get field change history for a specific record
 * @param tableName - Database table name
 * @param recordId - UUID of the record
 * @param fieldName - Specific field to track
 * @returns Array of changes to that field
 */
export async function getFieldHistory(
    tableName: string,
    recordId: string,
    fieldName: string
): Promise<Array<{
    changed_at: string;
    old_value: any;
    new_value: any;
    changed_by: string;
    user_email?: string;
}>> {
    const trail = await getAuditTrail(tableName, recordId);

    // Filter to only changes that affected this field
    const fieldChanges = trail
        .filter(log =>
            log.action === 'UPDATE' &&
            log.changed_fields?.includes(fieldName)
        )
        .map(log => ({
            changed_at: log.changed_at,
            old_value: log.old_data?.[fieldName],
            new_value: log.new_data?.[fieldName],
            changed_by: log.changed_by || '',
            user_email: log.user_email
        }));

    return fieldChanges;
}

/**
 * Application-level audit logging (for operations not captured by DB triggers)
 * @param action - Description of the action
 * @param entityType - Type of entity affected
 * @param entityId - ID of entity
 * @param details - Additional details
 */
export async function logAction(
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, any>
): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.warn('Cannot log action: No authenticated user');
        return;
    }

    // Get user profile for role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

    // Manual insert into audit_logs
    await supabase.from('audit_logs').insert({
        table_name: entityType,
        record_id: entityId,
        action: 'APPLICATION_ACTION',
        description: action,
        new_data: details,
        changed_by: user.id,
        user_email: user.email,
        user_role: profile?.role,
        changed_at: new Date().toISOString()
    });
}
