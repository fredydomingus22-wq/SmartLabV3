'use server';

import { createTenantSafeClient } from '@/lib/tenant-context';
import { sampleSchema, type SampleInput, validateData } from '@/lib/validations/schemas';
import { revalidatePath } from 'next/cache';

/**
 * Create a new sample with tenant isolation and validation
 * @throws Error if validation fails or user lacks permissions
 */
export async function createSample(data: SampleInput): Promise<{ id: string; code: string }> {
    // 1. Validate input data
    const validatedData = validateData(sampleSchema, data);

    // 2. Get tenant-safe client (automatically validates authentication and tenant membership)
    const { supabase, tenantId, userId } = await createTenantSafeClient();

    // 3. Generate sample code: SMP-YYYYMMDD-XXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

    // 4. Get count of samples created today for sequence number (tenant-scoped)
    const { count, error: countError } = await supabase
        .from('samples')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', new Date(now.setHours(0, 0, 0, 0)).toISOString());

    if (countError) {
        throw new Error(`Failed to generate sample code: ${countError.message}`);
    }

    const sequence = String((count || 0) + 1).padStart(3, '0');
    const code = `SMP-${dateStr}-${sequence}`;

    // 5. Insert sample with tenant_id
    const insertData = {
        code,
        tenant_id: tenantId,
        sample_type_id: validatedData.sample_type_id,
        product_id: validatedData.product_id || null,
        production_lot_id: validatedData.production_lot_id || null,
        intermediate_lot_id: validatedData.intermediate_lot_id || null,
        finished_product_lot_id: validatedData.finished_product_lot_id || null,
        raw_material_lot_id: validatedData.raw_material_lot_id || null,
        collection_point: validatedData.collection_point,
        collected_by: validatedData.collected_by,
        collected_at: validatedData.collected_at,
        notes: validatedData.notes || null,
        assigned_to: validatedData.assigned_to || null,
        status: validatedData.status || ('pending' as const)
    };

    const { data: sample, error } = await supabase
        .from('samples')
        .insert(insertData as any) // Type assertion to bypass Supabase type inference
        .select('id, code')
        .single();

    if (error) {
        // Provide detailed error messages
        if (error.code === 'PGRST116') {
            throw new Error('Failed to create sample: RLS policy violation. Check permissions.');
        }
        throw new Error(`Failed to create sample: ${error.message}`);
    }

    if (!sample) {
        throw new Error('Failed to create sample: No data returned');
    }

    revalidatePath('/lab/samples');
    return sample;
}
