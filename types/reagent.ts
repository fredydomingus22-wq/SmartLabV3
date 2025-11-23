export interface Reagent {
    id: string;
    code: string;
    name: string;
    description?: string;
    cas_number?: string;
    formula?: string;
    category: 'acid' | 'base' | 'indicator' | 'solvent' | 'buffer' | 'standard' | 'other';

    // Supplier
    supplier_id?: string;
    catalog_number?: string;
    manufacturer?: string;

    // Storage
    storage_location: string;
    storage_temp_min?: number;
    storage_temp_max?: number;
    hazard_class?: 'flammable' | 'corrosive' | 'toxic' | 'oxidizer' | 'explosive';
    safety_data_sheet_url?: string;

    // Stock
    unit: string;
    stock_current: number;
    stock_min: number;
    stock_max?: number;
    cost_per_unit?: number;

    status: 'active' | 'discontinued' | 'restricted';

    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface ReagentBatch {
    id: string;
    reagent_id: string;
    batch_number: string;
    lot_number?: string;

    received_date: string;
    received_quantity: number;
    received_by?: string;

    manufacture_date?: string;
    expiration_date?: string;
    opened_date?: string;

    quantity_remaining: number;
    unit: string;

    qc_status: 'pending' | 'approved' | 'rejected' | 'expired';
    qc_tested_by?: string;
    qc_tested_at?: string;
    qc_notes?: string;

    purchase_order?: string;
    invoice_number?: string;
    cost?: number;

    created_at: string;
    updated_at: string;
}

export interface ReagentUsage {
    id: string;
    reagent_id: string;
    batch_id?: string;
    quantity_used: number;
    unit: string;
    usage_type: 'analysis' | 'preparation' | 'calibration' | 'cleaning' | 'waste' | 'other';
    related_sample_id?: string;
    related_analysis_id?: string;
    used_by?: string;
    used_at: string;
    purpose?: string;
    notes?: string;
    created_at: string;
}

export interface ReagentWithStock extends Reagent {
    batches?: ReagentBatch[];
    total_batches?: number;
    expiring_soon_count?: number;
    low_stock?: boolean;
}
