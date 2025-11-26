/**
 * Specifications & Parameters Query Functions
 * Epic 4 - Specifications Management
 */

import { createClient } from '@/lib/supabase/client';

export interface Specification {
    id: string;
    product_id: string;
    phase: 'intermediate' | 'finished';
    name: string;
    description: string | null;
    version: number;
    is_active: boolean;
    effective_date: string;
    created_at: string;
    created_by: string | null;
}

export interface Parameter {
    id: string;
    specification_id: string;
    name: string;
    unit: string;
    min_value: number | null;
    max_value: number | null;
    test_method: string;
    is_active: boolean;
    created_at: string;
}

export interface ParameterInput {
    specification_id: string;
    name: string;
    unit: string;
    min_value: number | null;
    max_value: number | null;
    test_method: string;
    is_active?: boolean;
}

/**
 * Get all specifications for a product
 */
export async function getProductSpecifications(
    productId: string
): Promise<Specification[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('specifications')
        .select('*')
        .eq('product_id', productId)
        .order('phase', { ascending: true })
        .order('version', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Get active specification for a product and phase
 */
export async function getActiveSpecification(
    productId: string,
    phase: 'intermediate' | 'finished'
): Promise<Specification | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('specifications')
        .select('*')
        .eq('product_id', productId)
        .eq('phase', phase)
        .eq('is_active', true)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

/**
 * Get parameters for a specification
 */
export async function getSpecificationParameters(
    specId: string
): Promise<Parameter[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('parameters')
        .select('*')
        .eq('specification_id', specId)
        .eq('is_active', true)
        .order('name');

    if (error) throw error;
    return data || [];
}

/**
 * Create a new parameter
 */
export async function createParameter(
    input: ParameterInput
): Promise<Parameter> {
    const supabase = createClient();

    // Validate min < max
    if (input.min_value !== null && input.max_value !== null) {
        if (input.min_value >= input.max_value) {
            throw new Error('Min value must be less than max value');
        }
    }

    const { data, error } = await supabase
        .from('parameters')
        .insert({
            ...input,
            is_active: input.is_active ?? true,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update an existing parameter
 */
export async function updateParameter(
    id: string,
    input: Partial<ParameterInput>
): Promise<Parameter> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('parameters')
        .update(input)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a parameter (soft delete by setting is_active = false)
 * Only allowed if not used in any analyses
 */
export async function deleteParameter(id: string): Promise<void> {
    const supabase = createClient();

    // Check if parameter is used in any analyses
    const { count } = await supabase
        .from('lab_analysis')
        .select('*', { count: 'exact', head: true })
        .eq('parameter_id', id);

    if (count && count > 0) {
        throw new Error('Cannot delete parameter that is used in analyses');
    }

    // Soft delete
    const { error } = await supabase
        .from('parameters')
        .update({ is_active: false })
        .eq('id', id);

    if (error) throw error;
}

/**
 * Create a new version of a specification
 * Marks old version as inactive and creates new one
 */
export async function createSpecificationVersion(
    baseSpecId: string,
    updates: Partial<Specification>
): Promise<Specification> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    // Get current spec
    const { data: currentSpec, error: fetchError } = await supabase
        .from('specifications')
        .select('*')
        .eq('id', baseSpecId)
        .single();

    if (fetchError) throw fetchError;

    // Mark current as inactive
    const { error: updateError } = await supabase
        .from('specifications')
        .update({ is_active: false })
        .eq('id', baseSpecId);

    if (updateError) throw updateError;

    // Create new version
    const { data: newSpec, error: insertError } = await supabase
        .from('specifications')
        .insert({
            product_id: currentSpec.product_id,
            phase: currentSpec.phase,
            name: updates.name ?? currentSpec.name,
            description: updates.description ?? currentSpec.description,
            version: currentSpec.version + 1,
            is_active: true,
            effective_date: new Date().toISOString(),
            created_by: user.id,
        })
        .select()
        .single();

    if (insertError) throw insertError;

    // Copy all parameters from old spec to new spec
    const { data: oldParams } = await supabase
        .from('parameters')
        .select('*')
        .eq('specification_id', baseSpecId)
        .eq('is_active', true);

    if (oldParams && oldParams.length > 0) {
        const newParams = oldParams.map(param => ({
            specification_id: newSpec.id,
            name: param.name,
            unit: param.unit,
            min_value: param.min_value,
            max_value: param.max_value,
            test_method: param.test_method,
            is_active: true,
        }));

        await supabase.from('parameters').insert(newParams);
    }

    return newSpec;
}

/**
 * Get specification with parameters
 */
export async function getSpecificationWithParameters(
    specId: string
): Promise<Specification & { parameters: Parameter[] }> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('specifications')
        .select(`
      *,
      parameters:parameters(*)
    `)
        .eq('id', specId)
        .single();

    if (error) throw error;
    return data as any;
}
