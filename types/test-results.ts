// Test Results Types and Interfaces
import type { Database } from "@/types/database";

export type LabAnalysisRow = Database["public"]["Tables"]["lab_analysis"]["Row"];

export type ResultStatus = "not_tested" | "no_spec" | "below_spec" | "above_spec" | "within_spec";

export type AnalysisStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface TestResult {
    id: string;
    sample_id: string;
    parameter_id: string;
    parameter_name: string;
    result_value: number | null;
    unit: string | null;
    spec_min: number | null;
    spec_max: number | null;
    spec_target: number | null;
    result_status: ResultStatus;
    analyst_id: string | null;
    performed_by: string | null;
    analysis_date: string | null;
    validation_status: "approved" | "failed" | "deviation";
    reviewer_id: string | null;
    comment: string | null;
    attachments: Array<{ name: string; url: string }>;
    status: AnalysisStatus;
    created_at: string;
}

export interface TestResultWithSample extends TestResult {
    sample_code: string;
    sample_type: string;
    sample_status: string;
    product_name: string | null;
}

export interface CreateTestResultInput {
    sample_id: string;
    parameter_id: string;
    result_value: number;
    unit?: string;
    analyst_id?: string;
    performed_by?: string;
    comment?: string;
    attachments?: Array<{ name: string; url: string }>;
}

export interface UpdateTestResultInput {
    result_value?: number;
    comment?: string;
    validation_status?: "approved" | "failed" | "deviation";
    reviewer_id?: string;
    status?: AnalysisStatus;
}
