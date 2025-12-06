// Test Results Queries - Data fetching for lab analysis
import { createClient } from "@/lib/supabase/client";
import type { TestResult, TestResultWithSample } from "@/types/test-results";

/**
 * Get all test results for a specific sample
 */
export async function getTestResultsBySample(sampleId: string): Promise<TestResult[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("sample_results_with_specs")
        .select("*")
        .eq("sample_id", sampleId)
        .order("parameter_name");

    if (error) throw error;
    return (data as any[]) || [];
}

/**
 * Get historical results for a specific parameter and product
 * Used for trend analysis and comparison
 */
export async function getHistoricalResults(
    productId: string,
    parameterId: string,
    limit: number = 10
): Promise<TestResultWithSample[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("sample_results_with_specs")
        .select("*")
        .eq("parameter_id", parameterId)
        .eq("product_id", productId)
        .not("result_value", "is", null)
        .order("analysis_date", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return (data as any[]) || [];
}

/**
 * Get test results with pass/fail summary for a sample
 */
export async function getTestResultsSummary(sampleId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("sample_results_with_specs")
        .select("result_status")
        .eq("sample_id", sampleId);

    if (error) throw error;

    const summary = {
        total: data?.length || 0,
        passed: data?.filter(r => r.result_status === "within_spec").length || 0,
        failed: data?.filter(r => r.result_status === "below_spec" || r.result_status === "above_spec").length || 0,
        pending: data?.filter(r => r.result_status === "not_tested").length || 0,
        no_spec: data?.filter(r => r.result_status === "no_spec").length || 0,
    };

    return summary;
}

/**
 * Create a new test result
 */
export async function createTestResult(input: {
    sample_id: string;
    parameter_id: string;
    result_value: number;
    unit?: string;
    analyst_id?: string;
    performed_by?: string;
    comment?: string;
    attachments?: any;
}) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("lab_analysis")
        .insert({
            ...input,
            analysis_date: new Date().toISOString(),
            validation_status: "approved", // Default, can be reviewed later
            status: "completed",
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update an existing test result
 */
export async function updateTestResult(
    id: string,
    updates: {
        result_value?: number;
        comment?: string;
        validation_status?: "approved" | "failed" | "deviation";
        reviewer_id?: string;
        status?: string;
    }
) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("lab_analysis")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a test result
 */
export async function deleteTestResult(id: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from("lab_analysis")
        .delete()
        .eq("id", id);

    if (error) throw error;
}
