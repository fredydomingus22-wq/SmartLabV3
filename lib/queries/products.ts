import { createClient } from "@/lib/supabase/client";
import {
    Product,
    ProductWithDetails,
    CreateProductData,
    UpdateProductData,
    ProductFilters,
    ProductQualitySummary
} from "@/types/product";

const supabase = createClient();

// ============================================================================
// PRODUCTS CRUD
// ============================================================================

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
    let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (filters?.active !== undefined) {
        query = query.eq('active', filters.active);
    }

    if (filters?.product_type) {
        query = query.eq('product_type', filters.product_type);
    }

    if (filters?.category) {
        query = query.eq('category', filters.category);
    }

    if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as Product;
}

// Alias for cleaner imports
export const getProduct = getProductById;

export async function getProductWithSpecs(id: string): Promise<ProductWithDetails | null> {
    const { data: product, error: productError } = await supabase
        .from('products')
        .select(`
            *,
            specs:product_specs(
                *,
                parameter:parameters(*)
            )
        `)
        .eq('id', id)
        .single();

    if (productError) throw productError;

    // Get test statistics
    const { data: stats } = await supabase
        .from('product_tests')
        .select('result_status')
        .eq('product_id', id);

    const test_count = stats?.length || 0;
    const tests_passed = stats?.filter(t => t.result_status === 'in_spec').length || 0;
    const pass_rate = test_count > 0 ? (tests_passed / test_count) * 100 : 0;

    // Get latest test
    const { data: latestTest } = await supabase
        .from('product_tests')
        .select(`
            *,
            parameter:parameters(name, description)
        `)
        .eq('product_id', id)
        .order('tested_at', { ascending: false })
        .limit(1)
        .single();

    return {
        ...product,
        test_count,
        pass_rate,
        latest_test: latestTest || undefined
    } as ProductWithDetails;
}

export async function createProduct(data: CreateProductData): Promise<Product> {
    const { data: product, error } = await supabase
        .from('products')
        .insert([data])
        .select()
        .single();

    if (error) throw error;
    return product as Product;
}

export async function updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    const { data: product, error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return product as Product;
}

export async function deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function toggleProductActive(id: string): Promise<Product> {
    // Get current active status
    const { data: current } = await supabase
        .from('products')
        .select('active')
        .eq('id', id)
        .single();

    // Toggle it
    const { data: product, error } = await supabase
        .from('products')
        .update({ active: !current?.active })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return product as Product;
}

// ============================================================================
// PRODUCT STATISTICS
// ============================================================================

export async function getProductStats(productId: string) {
    const { data, error } = await supabase
        .from('product_quality_summary')
        .select('*')
        .eq('product_id', productId)
        .single();

    if (error) throw error;
    return data as ProductQualitySummary;
}

export async function getAllProductsWithStats(): Promise<ProductQualitySummary[]> {
    const { data, error } = await supabase
        .from('product_quality_summary')
        .select('*')
        .order('product_name');

    if (error) throw error;
    return data as ProductQualitySummary[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function checkSkuExists(sku: string, excludeId?: string): Promise<boolean> {
    let query = supabase
        .from('products')
        .select('id')
        .eq('sku', sku);

    if (excludeId) {
        query = query.neq('id', excludeId);
    }

    const { data } = await query;
    return (data?.length || 0) > 0;
}

export async function getProductCategories(): Promise<string[]> {
    const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

    if (error) throw error;

    // Get unique categories
    const categories = Array.from(new Set(data.map(p => p.category).filter(Boolean)));
    return categories as string[];
}
