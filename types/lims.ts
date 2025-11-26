import type { SampleStatus } from "@/lib/constants/status";
import type { SamplePhase, SampleType } from "@/lib/validations/samples";

export interface Sample {
    id: string;
    code: string;
    sample_type: SampleType;
    phase?: SamplePhase | null;
    product_id?: string | null;
    production_lot_id?: string | null;
    intermediate_lot_id?: string | null;
    tank_id?: string | null;
    status: SampleStatus;
    priority?: "normal" | "high" | "urgent";
    assigned_to?: string | null;
    collected_by?: string | null;
    collected_at: string;
    received_by?: string | null;
    received_at?: string | null;
    observations?: string | null;
    sequence_number?: number | null;
    collection_site?: string | null;
    created_at: string;
    updated_at?: string | null;

    // Relations (flattened for UI convenience)
    product?: {
        id?: string;
        name?: string;
        sku?: string;
        code?: string;
    };
    tank?: {
        id?: string;
        code?: string;
        name?: string;
    };
    production_lot?: {
        id?: string;
        code?: string;
    };
}

export interface LabAnalysis {
    id: string;
    sample_id: string;
    parameter_id: string;
    result_value?: number;
    unit?: string;
    limit_min?: number;
    limit_max?: number;
    analyst_id?: string;
    analysis_date?: string;
    validation_status: 'approved' | 'failed' | 'deviation';
    reviewer_id?: string;
    created_at: string;

    // Relations
    sample?: Sample;
    parameter?: {
        id: string;
        name: string;
        unit?: string;
    };
    analyst?: {
        id: string;
        full_name: string;
    };
}
