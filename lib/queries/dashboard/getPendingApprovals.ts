'use server';

import { createTenantSafeClient } from '@/lib/tenant-context';

export interface PendingApproval {
    id: string;
    type: 'lot_release' | 'nc_closure' | 'spec_change' | 'sample_approval' | 'other';
    title: string;
    description: string | null;
    requestedBy: string;
    requestedByName: string;
    requestedAt: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    relatedEntityId: string;
}

export async function getPendingApprovals(): Promise<PendingApproval[]> {
    const { supabase, tenantId } = await createTenantSafeClient();

    const { data, error } = await supabase
        .from('approval_requests')
        .select(`
            id,
            type,
            title,
            description,
            requested_by,
            requested_at,
            urgency,
            related_entity_id,
            profiles:requested_by (
                full_name
            )
        `)
        .eq('tenant_id', tenantId)
        .eq('status', 'pending')
        .order('urgency', { ascending: false })
        .order('requested_at', { ascending: true })
        .limit(10);

    if (error) throw new Error(`Failed to fetch approvals: ${error.message}`);

    return (data || []).map((row: any) => ({
        id: row.id,
        type: row.type as any,
        title: row.title,
        description: row.description,
        requestedBy: row.requested_by,
        requestedByName: (row.profiles as any)?.full_name || 'Unknown User',
        requestedAt: row.requested_at,
        urgency: row.urgency as any,
        relatedEntityId: row.related_entity_id
    }));
}
