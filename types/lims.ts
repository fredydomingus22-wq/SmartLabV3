export interface Sample {
    id: string;
    code: string;
    type: string;
    raw_material_lot_id?: string;
    production_lot_id?: string;
    status: 'pending' | 'in_analysis' | 'reviewed' | 'approved';
    priority: 'normal' | 'high' | 'urgent';
    collected_by?: string;
    collected_at?: string;
    received_by?: string;
    received_at?: string;
    notes?: string;
    created_at: string;
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
