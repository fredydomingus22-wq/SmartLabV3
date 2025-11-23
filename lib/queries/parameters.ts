import { createClient } from "@/lib/supabase/client";

// ============================================================================
// TYPES
// ============================================================================

export interface ProductParameterSpec {
    id: string;
    product_id: string;
    parameter_id: string;
    spec_min: number | null;
    spec_target: number | null;
    spec_max: number | null;
    unit: string | null;
    created_at: string;
    parameter?: {
        id: string;
        name: string;
        description: string | null;
    };
}

export interface Parameter {
    id: string;
    name: string;
    description: string | null;
    unit: string | null;
    category: string | null;
    created_at: string;
    updated_at?: string;
}

export interface CreateParameterData {
    name: string;
    description?: string;
    unit?: string;
    category?: string;
}

export interface ParameterWithUsage extends Parameter {
    usage_count: number;
    products?: Array<{
        id: string;
        name: string;
        sku: string;
    }>;
}

// ============================================================================
// PRODUCT SPECS WITH PARAMETERS
// ============================================================================

export async function getProductParametersWithLimits(productId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('product_specs')
        .select(`
            *,
            parameter:parameters(*)
        `)
        .eq('product_id', productId);

    if (error) throw error;
    return data as ProductParameterSpec[];
}

// ============================================================================
// GLOBAL PARAMETERS CRUD
// ============================================================================

export async function getAllParameters(): Promise<Parameter[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('parameters')
        .select('*')
        .order('name', { ascending: true });

    if (error) throw error;
    return data as Parameter[];
}

export async function getParameterById(id: string): Promise<Parameter | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('parameters')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as Parameter;
}

export async function createParameter(parameterData: CreateParameterData): Promise<Parameter> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('parameters')
        .insert([parameterData])
        .select()
        .single();

    if (error) throw error;
    return data as Parameter;
}

export async function updateParameter(
    id: string,
    updates: Partial<CreateParameterData>
): Promise<Parameter> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('parameters')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Parameter;
}

export async function deleteParameter(id: string): Promise<void> {
    const supabase = createClient();

    // Check if parameter is in use
    const usageCount = await getParameterUsageCount(id);
    if (usageCount > 0) {
        throw new Error(`Cannot delete parameter. It is used in ${usageCount} product specification(s).`);
    }

    const { error } = await supabase
        .from('parameters')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

export async function getParameterUsageCount(parameterId: string): Promise<number> {
    const supabase = createClient();
    const { count, error } = await supabase
        .from('product_specs')
        .select('*', { count: 'exact', head: true })
        .eq('parameter_id', parameterId);

    if (error) throw error;
    return count || 0;
}

export async function getProductsUsingParameter(parameterId: string): Promise<Array<{
    id: string;
    name: string;
    sku: string;
    spec_min: number | null;
    spec_target: number | null;
    spec_max: number | null;
    is_critical: boolean | null;
}>> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('product_specs')
        .select(`
            spec_min,
            spec_target,
            spec_max,
            is_critical,
            product:products(id, name, sku)
        `)
        .eq('parameter_id', parameterId);

    if (error) throw error;

    return (data || []).map((spec: any) => ({
        id: spec.product.id,
        name: spec.product.name,
        sku: spec.product.sku,
        spec_min: spec.spec_min,
        spec_target: spec.spec_target,
        spec_max: spec.spec_max,
        is_critical: spec.is_critical
    }));
}

export async function getParametersWithUsage(): Promise<ParameterWithUsage[]> {
    const parameters = await getAllParameters();

    // Get usage counts for all parameters
    const parametersWithUsage = await Promise.all(
        parameters.map(async (param) => {
            const usageCount = await getParameterUsageCount(param.id);
            return {
                ...param,
                usage_count: usageCount
            };
        })
    );

    return parametersWithUsage;
}

// ============================================================================
// CATEGORY MANAGEMENT
// ============================================================================

export async function getParameterCategories(): Promise<string[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('parameters')
        .select('category')
        .not('category', 'is', null);

    if (error) throw error;

    // Extract unique categories
    const categories = Array.from(new Set((data || [])
        .map((item: any) => item.category)
        .filter(Boolean)
    ));

    return categories as string[];
}

export const DEFAULT_PARAMETER_CATEGORIES = [
    'Physicochemical',
    'Microbiological',
    'Sensory',
    'Nutritional',
    'Contaminants',
    'Packaging',
    'Other'
];
