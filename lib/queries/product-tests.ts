import { createClient } from "@/lib/supabase/client";
import { ProductTest, CreateProductTestData, ProductTestFilters } from "@/types/product";

const supabase = createClient();

// ============================================================================
// PRODUCT TESTS CRUD
// ============================================================================

export async function getProductTests(
    productId: string,
    filters?: ProductTestFilters
): Promise<ProductTest[]> {
    let query = supabase
        .from('product_tests')
        .select(`
            *,
            parameter:parameters(id, name, description),
            production_lot:production_lots(id, code)
        `)
        .eq('product_id', productId)
        .order('tested_at', { ascending: false });

    if (filters?.test_level) {
        query = query.eq('test_level', filters.test_level);
    }

    if (filters?.result_status) {
        query = query.eq('result_status', filters.result_status);
    }

    if (filters?.date_from) {
        query = query.gte('tested_at', filters.date_from);
    }

    if (filters?.date_to) {
        query = query.lte('tested_at', filters.date_to);
    }

    if (filters?.parameter_id) {
        query = query.eq('parameter_id', filters.parameter_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as ProductTest[];
}

export async function getTestsForLot(lotId: string): Promise<ProductTest[]> {
    const { data, error } = await supabase
        .from('product_tests')
        .select(`
            *,
            parameter:parameters(id, name, description)
        `)
        .eq('production_lot_id', lotId)
        .order('tested_at', { ascending: false });

    if (error) throw error;
    return data as ProductTest[];
}

export async function getTestsForTank(tankId: string): Promise<ProductTest[]> {
    const { data, error } = await supabase
        .from('product_tests')
        .select(`
            *,
            parameter:parameters(id, name, description)
        `)
        .eq('tank_id', tankId)
        .order('tested_at', { ascending: false });

    if (error) throw error;
    return data as ProductTest[];
}

export async function getTestsForSample(sampleId: string): Promise<ProductTest[]> {
    const { data, error } = await supabase
        .from('product_tests')
        .select(`
            *,
            parameter:parameters(id, name, description)
        `)
        .eq('sample_id', sampleId)
        .order('tested_at', { ascending: false });

    if (error) throw error;
    return data as ProductTest[];
}

export async function createProductTest(testData: CreateProductTestData): Promise<ProductTest> {
    const { data, error } = await supabase
        .from('product_tests')
        .insert([{
            ...testData,
            tested_at: testData.tested_at || new Date().toISOString()
        }])
        .select(`
            *,
            parameter:parameters(id, name, description)
        `)
        .single();

    if (error) throw error;
    return data as ProductTest;
}

// ============================================================================
// STATISTICS AND ANALYTICS
// ============================================================================

export interface TestStatistics {
    total_tests: number;
    tests_passed: number;
    tests_failed: number;
    pass_rate: number;
    critical_failures: number;
    tests_by_level: {
        incoming: number;
        in_process: number;
        finished: number;
        line: number;
    };
    recent_trend: 'improving' | 'stable' | 'declining';
}

export async function getTestStatistics(productId: string): Promise<TestStatistics> {
    const { data: allTests, error } = await supabase
        .from('product_tests')
        .select('result_status, test_level, tested_at')
        .eq('product_id', productId);

    if (error) throw error;

    const total_tests = allTests?.length || 0;
    const tests_passed = allTests?.filter(t => t.result_status === 'in_spec').length || 0;
    const tests_failed = total_tests - tests_passed;
    const pass_rate = total_tests > 0 ? (tests_passed / total_tests) * 100 : 0;

    // Count critical failures (assuming we join with specs to check is_critical)
    const { data: criticalTests } = await supabase
        .from('product_tests')
        .select(`
            result_status,
            parameter:parameters(
                id,
                product_specs!inner(is_critical)
            )
        `)
        .eq('product_id', productId)
        .eq('result_status', 'out_of_spec');

    const critical_failures = criticalTests?.filter(t => {
        const p = t.parameter as any;
        const param = Array.isArray(p) ? p[0] : p;
        return param?.product_specs?.[0]?.is_critical;
    }).length || 0;

    // Count by level
    const tests_by_level = {
        incoming: allTests?.filter(t => t.test_level === 'incoming').length || 0,
        in_process: allTests?.filter(t => t.test_level === 'in_process').length || 0,
        finished: allTests?.filter(t => t.test_level === 'finished').length || 0,
        line: allTests?.filter(t => t.test_level === 'line').length || 0,
    };

    // Calculate trend (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentTests = allTests?.filter(t => new Date(t.tested_at) >= thirtyDaysAgo) || [];
    const previousTests = allTests?.filter(
        t => new Date(t.tested_at) >= sixtyDaysAgo && new Date(t.tested_at) < thirtyDaysAgo
    ) || [];

    const recentPassRate = recentTests.length > 0
        ? (recentTests.filter(t => t.result_status === 'in_spec').length / recentTests.length) * 100
        : 0;
    const previousPassRate = previousTests.length > 0
        ? (previousTests.filter(t => t.result_status === 'in_spec').length / previousTests.length) * 100
        : 0;

    let recent_trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentPassRate > previousPassRate + 5) {
        recent_trend = 'improving';
    } else if (recentPassRate < previousPassRate - 5) {
        recent_trend = 'declining';
    }

    return {
        total_tests,
        tests_passed,
        tests_failed,
        pass_rate,
        critical_failures,
        tests_by_level,
        recent_trend
    };
}

export async function getOutOfSpecTests(
    productId: string,
    dateFrom?: string,
    dateTo?: string
): Promise<ProductTest[]> {
    let query = supabase
        .from('product_tests')
        .select(`
            *,
            parameter:parameters(id, name, description),
            production_lot:production_lots(id, code)
        `)
        .eq('product_id', productId)
        .eq('result_status', 'out_of_spec')
        .order('tested_at', { ascending: false });

    if (dateFrom) {
        query = query.gte('tested_at', dateFrom);
    }

    if (dateTo) {
        query = query.lte('tested_at', dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as ProductTest[];
}

// ============================================================================
// PARAMETER TRENDS
// ============================================================================

export interface ParameterTrend {
    parameter_id: string;
    parameter_name: string;
    values: {
        date: string;
        value: number;
        status: 'in_spec' | 'out_of_spec';
    }[];
    average: number;
    min: number;
    max: number;
    std_dev?: number;
}

export async function getParameterTrend(
    productId: string,
    parameterId: string,
    dateFrom?: string,
    dateTo?: string
): Promise<ParameterTrend> {
    let query = supabase
        .from('product_tests')
        .select(`
            measured_value,
            result_status,
            tested_at,
            parameter:parameters(id, name)
        `)
        .eq('product_id', productId)
        .eq('parameter_id', parameterId)
        .order('tested_at', { ascending: true });

    if (dateFrom) {
        query = query.gte('tested_at', dateFrom);
    }

    if (dateTo) {
        query = query.lte('tested_at', dateTo);
    }

    const { data, error } = await query;

    if (error) throw error;

    const values = (data || []).map(t => ({
        date: t.tested_at,
        value: t.measured_value,
        status: t.result_status
    }));

    const numericValues = values.map(v => v.value);
    const average = numericValues.reduce((a, b) => a + b, 0) / numericValues.length || 0;
    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);

    return {
        parameter_id: parameterId,
        parameter_name: (() => {
            const p = data?.[0]?.parameter as any;
            const param = Array.isArray(p) ? p[0] : p;
            return param?.name || 'Unknown';
        })(),
        values,
        average,
        min,
        max
    };
}
