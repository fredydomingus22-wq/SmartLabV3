import { createClient } from "@/lib/supabase/client";
import { ProductSpec, CreateProductSpecData } from "@/types/product";

const supabase = createClient();

// ============================================================================
// PRODUCT SPECS CRUD
// ============================================================================

export async function getProductSpecs(productId: string): Promise<ProductSpec[]> {
    const { data, error } = await supabase
        .from('product_specs')
        .select(`
            *,
            parameter:parameters(
                id,
                name,
                description,
                unit,
                category
            )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data as ProductSpec[];
}

export async function getProductSpecById(id: string): Promise<ProductSpec | null> {
    const { data, error } = await supabase
        .from('product_specs')
        .select(`
            *,
            parameter:parameters(*)
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as ProductSpec;
}

export async function createProductSpec(specData: CreateProductSpecData): Promise<ProductSpec> {
    const { data, error } = await supabase
        .from('product_specs')
        .insert([specData])
        .select(`
            *,
            parameter:parameters(*)
        `)
        .single();

    if (error) throw error;
    return data as ProductSpec;
}

export async function updateProductSpec(
    id: string,
    updates: Partial<CreateProductSpecData>
): Promise<ProductSpec> {
    const { data, error } = await supabase
        .from('product_specs')
        .update(updates)
        .eq('id', id)
        .select(`
            *,
            parameter:parameters(*)
        `)
        .single();

    if (error) throw error;
    return data as ProductSpec;
}

export async function deleteProductSpec(id: string): Promise<void> {
    const { error } = await supabase
        .from('product_specs')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export async function bulkCreateSpecs(
    productId: string,
    specs: Omit<CreateProductSpecData, 'product_id'>[]
): Promise<ProductSpec[]> {
    const specsWithProduct = specs.map(spec => ({
        ...spec,
        product_id: productId
    }));

    const { data, error } = await supabase
        .from('product_specs')
        .insert(specsWithProduct)
        .select(`
            *,
            parameter:parameters(*)
        `);

    if (error) throw error;
    return data as ProductSpec[];
}

export async function deleteAllProductSpecs(productId: string): Promise<void> {
    const { error } = await supabase
        .from('product_specs')
        .delete()
        .eq('product_id', productId);

    if (error) throw error;
}

// ============================================================================
// FILTERED QUERIES
// ============================================================================

export async function getSpecsByTestLevel(
    productId: string,
    testLevel: 'incoming' | 'in_process' | 'finished' | 'line'
): Promise<ProductSpec[]> {
    const { data, error } = await supabase
        .from('product_specs')
        .select(`
            *,
            parameter:parameters(*)
        `)
        .eq('product_id', productId)
        .eq('test_level', testLevel)
        .order('created_at');

    if (error) throw error;
    return data as ProductSpec[];
}

export async function getCriticalSpecs(productId: string): Promise<ProductSpec[]> {
    const { data, error } = await supabase
        .from('product_specs')
        .select(`
            *,
            parameter:parameters(*)
        `)
        .eq('product_id', productId)
        .eq('is_critical', true)
        .order('created_at');

    if (error) throw error;
    return data as ProductSpec[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function checkSpecExists(
    productId: string,
    parameterId: string,
    excludeId?: string
): Promise<boolean> {
    let query = supabase
        .from('product_specs')
        .select('id')
        .eq('product_id', productId)
        .eq('parameter_id', parameterId);

    if (excludeId) {
        query = query.neq('id', excludeId);
    }

    const { data } = await query;
    return (data?.length || 0) > 0;
}

export function validateSpecLimits(
    min: number | null,
    target: number | null,
    max: number | null
): boolean {
    // If any value is null, skip validation
    if (min === null || target === null || max === null) {
        return true;
    }

    // Check that min < target < max
    return min < target && target < max;
}

export async function copySpecsFromProduct(
    sourceProductId: string,
    targetProductId: string
): Promise<ProductSpec[]> {
    // Get specs from source product
    const sourceSpecs = await getProductSpecs(sourceProductId);

    // Create new specs for target product
    const newSpecs = sourceSpecs.map(({ id, product_id, created_at, updated_at, parameter, ...spec }) => ({
        ...spec,
        unit: spec.unit ?? undefined,
        spec_min: spec.spec_min ?? undefined,
        spec_target: spec.spec_target ?? undefined,
        spec_max: spec.spec_max ?? undefined
    }));

    return await bulkCreateSpecs(targetProductId, newSpecs);
}
