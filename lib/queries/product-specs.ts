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

export function validateSpecLimits(min?: number, target?: number, max?: number): boolean {
    if (min !== undefined && max !== undefined && min > max) {
        return false;
    }
    if (target !== undefined) {
        if (min !== undefined && target < min) return false;
        if (max !== undefined && target > max) return false;
    }
    return true;
}

export async function copySpecsFromProduct(
    fromProductId: string,
    toProductId: string
): Promise<ProductSpec[]> {
    const specs = await getProductSpecs(fromProductId);

    const specsToCreate = specs.map(spec => ({
        product_id: toProductId,
        parameter_id: spec.parameter_id,
        spec_min: spec.spec_min,
        spec_target: spec.spec_target,
        spec_max: spec.spec_max,
        unit: spec.unit,
        test_frequency: spec.test_frequency,
        test_level: spec.test_level,
        is_critical: spec.is_critical,
        notes: spec.notes
    }));

    return await bulkCreateSpecs(toProductId, specsToCreate as any);
}

// ============================================================================
// AGGREGATED QUERIES FOR DASHBOARD
// ============================================================================

export interface SpecAggregated {
    id: string;
    product_id: string;
    product_name: string;
    product_sku: string;
    product_type: string | null;
    parameter_id: string;
    parameter_name: string;
    parameter_category: string | null;
    spec_min: number | null;
    spec_target: number | null;
    spec_max: number | null;
    unit: string | null;
    test_frequency: string | null;
    test_level: string | null;
    is_critical: boolean | null;
    created_at: string;
}

export async function getAllSpecsAggregated(): Promise<SpecAggregated[]> {
    const { data, error } = await supabase
        .from('product_specs')
        .select(`
            *,
            product:products(id, name, sku, product_type),
            parameter:parameters(id, name, category, unit)
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((spec: any) => ({
        id: spec.id,
        product_id: spec.product_id,
        product_name: spec.product?.name || '',
        product_sku: spec.product?.sku || '',
        product_type: spec.product?.product_type || null,
        parameter_id: spec.parameter_id,
        parameter_name: spec.parameter?.name || '',
        parameter_category: spec.parameter?.category || null,
        spec_min: spec.spec_min,
        spec_target: spec.spec_target,
        spec_max: spec.spec_max,
        unit: spec.unit || spec.parameter?.unit || null,
        test_frequency: spec.test_frequency,
        test_level: spec.test_level,
        is_critical: spec.is_critical,
        created_at: spec.created_at
    }));
}

export interface SpecsStats {
    total_specs: number;
    critical_specs: number;
    total_products_with_specs: number;
    total_parameters_used: number;
    specs_by_level: Record<string, number>;
    specs_by_frequency: Record<string, number>;
}

export async function getSpecsStats(): Promise<SpecsStats> {
    const specs = await getAllSpecsAggregated();

    const totalSpecs = specs.length;
    const criticalSpecs = specs.filter(s => s.is_critical).length;

    const uniqueProducts = new Set(specs.map(s => s.product_id));
    const uniqueParameters = new Set(specs.map(s => s.parameter_id));

    const specsByLevel: Record<string, number> = {};
    const specsByFrequency: Record<string, number> = {};

    specs.forEach(spec => {
        if (spec.test_level) {
            specsByLevel[spec.test_level] = (specsByLevel[spec.test_level] || 0) + 1;
        }
        if (spec.test_frequency) {
            specsByFrequency[spec.test_frequency] = (specsByFrequency[spec.test_frequency] || 0) + 1;
        }
    });

    return {
        total_specs: totalSpecs,
        critical_specs: criticalSpecs,
        total_products_with_specs: uniqueProducts.size,
        total_parameters_used: uniqueParameters.size,
        specs_by_level: specsByLevel,
        specs_by_frequency: specsByFrequency
    };
}

// ============================================================================
// BULK UPDATE OPERATIONS
// ============================================================================

export interface BulkSpecUpdate {
    id: string;
    updates: Partial<CreateProductSpecData>;
}

export async function bulkUpdateSpecs(updates: BulkSpecUpdate[]): Promise<ProductSpec[]> {
    const updatedSpecs: ProductSpec[] = [];

    for (const { id, updates: specUpdates } of updates) {
        const updated = await updateProductSpec(id, specUpdates);
        updatedSpecs.push(updated);
    }

    return updatedSpecs;
}
