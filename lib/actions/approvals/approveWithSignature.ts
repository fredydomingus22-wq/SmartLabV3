'use server';

import { createTenantSafeClient } from '@/lib/tenant-context';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/supabase';

// Define explicit types derived from the Database interface
type ApprovalRequestRow = Database['public']['Tables']['approval_requests']['Row'];
type ApprovalRequestUpdate = Database['public']['Tables']['approval_requests']['Update'];
type ApprovalSignatureInsert = Database['public']['Tables']['approval_signatures']['Insert'];

interface ApprovalPayload {
    approvalId: string;
    password: string;
    comments?: string;
}

export async function approveWithSignature(payload: ApprovalPayload) {
    const { supabase, tenantId, userId } = await createTenantSafeClient();

    // 1. Verify user has permission to approve
    const { data: approvalData, error: fetchError } = await supabase
        .from('approval_requests')
        .select('id, status, type, title, tenant_id, requested_by')
        .eq('id', payload.approvalId)
        .eq('tenant_id', tenantId)
        .single();

    if (fetchError || !approvalData) {
        throw new Error('Approval request not found');
    }

    // Explicitly cast the result to a partial of the Row type
    const approval = approvalData as unknown as Pick<ApprovalRequestRow, 'id' | 'status' | 'type' | 'title' | 'tenant_id' | 'requested_by'>;

    if (approval.status !== 'pending') {
        throw new Error(`Cannot approve: request is ${approval.status}`);
    }

    // 2. Update approval request
    const updatePayload: ApprovalRequestUpdate = {
        status: 'approved',
        approved_by: userId,
        approved_at: new Date().toISOString()
    };

    // Cast the query builder to work around type inference limitations
    const { error: updateError } = await (supabase
        .from('approval_requests') as unknown as { update: (data: ApprovalRequestUpdate) => { eq: (col: string, val: string) => { eq: (col: string, val: string) => Promise<{ error: Error | null }> } } })
        .update(updatePayload)
        .eq('id', payload.approvalId)
        .eq('tenant_id', tenantId);

    if (updateError) {
        throw new Error(`Failed to approve: ${updateError.message}`);
    }

    // 3. Create signature record
    const signaturePayload: ApprovalSignatureInsert = {
        approval_request_id: payload.approvalId,
        user_id: userId,
        action: 'approve',
        signature_method: 'password',
        comments: payload.comments,
        tenant_id: tenantId
    };

    // Cast the query builder to work around type inference limitations
    const { error: sigError } = await (supabase
        .from('approval_signatures') as unknown as { insert: (data: ApprovalSignatureInsert) => Promise<{ error: Error | null }> })
        .insert(signaturePayload);

    if (sigError) {
        throw new Error(`Failed to create signature: ${sigError.message}`);
    }

    revalidatePath('/dashboard');
    return { success: true, approvalId: payload.approvalId };
}

export async function rejectWithSignature(payload: ApprovalPayload & { reason: string }) {
    const { supabase, tenantId, userId } = await createTenantSafeClient();

    // 1. Verify approval exists
    const { data: approvalData, error: fetchError } = await supabase
        .from('approval_requests')
        .select('id, status, type, title, tenant_id, requested_by')
        .eq('id', payload.approvalId)
        .eq('tenant_id', tenantId)
        .single();

    if (fetchError || !approvalData) {
        throw new Error('Approval request not found');
    }

    // Explicitly cast the result
    const approval = approvalData as unknown as Pick<ApprovalRequestRow, 'id' | 'status' | 'type' | 'title' | 'tenant_id' | 'requested_by'>;

    if (approval.status !== 'pending') {
        throw new Error(`Cannot reject: request is ${approval.status}`);
    }

    // 2. Update approval request
    const updatePayload: ApprovalRequestUpdate = {
        status: 'rejected',
        rejected_by: userId,
        rejected_at: new Date().toISOString(),
        rejection_reason: payload.reason
    };

    // Cast the query builder to work around type inference limitations
    const { error: updateError } = await (supabase
        .from('approval_requests') as unknown as { update: (data: ApprovalRequestUpdate) => { eq: (col: string, val: string) => { eq: (col: string, val: string) => Promise<{ error: Error | null }> } } })
        .update(updatePayload)
        .eq('id', payload.approvalId)
        .eq('tenant_id', tenantId);

    if (updateError) {
        throw new Error(`Failed to reject: ${updateError.message}`);
    }

    // 3. Create signature record
    const signaturePayload: ApprovalSignatureInsert = {
        approval_request_id: payload.approvalId,
        user_id: userId,
        action: 'reject',
        signature_method: 'password',
        comments: payload.comments,
        tenant_id: tenantId
    };

    // Cast the query builder to work around type inference limitations
    const { error: sigError } = await (supabase
        .from('approval_signatures') as unknown as { insert: (data: ApprovalSignatureInsert) => Promise<{ error: Error | null }> })
        .insert(signaturePayload);

    if (sigError) {
        throw new Error(`Failed to create signature: ${sigError.message}`);
    }

    revalidatePath('/dashboard');
    return { success: true, approvalId: payload.approvalId };
}
