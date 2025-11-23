import { createClient } from "@/lib/supabase/client";

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
