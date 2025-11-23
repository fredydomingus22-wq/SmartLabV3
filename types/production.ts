export interface Product {
    id: string;
    name: string;
    sku: string;
    description: string | null;
    created_at: string;
}

export interface ProductionLot {
    id: string;
    code: string;
    product_id: string;
    status: 'open' | 'closed' | 'blocked';
    created_at: string;
    // Optional fields
    factory_id?: string;
    line_id?: string;
    production_line?: string;
    shift?: string;
    start_time?: string;
    end_time?: string;
    created_by?: string;
    // Joined fields
    product?: Product;
}

// Renamed from IntermediateLot → IntermediateTank
export interface IntermediateTank {
    id: string;
    production_lot_id: string;
    tank_code: string;  // e.g., TK501
    syrup_name: string; // Nome do xarope preparado
    start_at: string;
    end_at: string | null;
    status: 'active' | 'finished';
    prepared_by: string; // Nome do xaropeiro / técnico responsável
    created_at: string;
    // No ingredients field - managed via form builder with target_module='intermediate_tank'
    // Joined fields
    production_lot?: ProductionLot;
}

// Replaces FinishedLot concept
export interface LineSample {
    id: string;
    tank_id: string;
    production_lot_id: string;
    product_id: string;  // Auto-loaded from tank/lot
    sample_time: string;
    collected_by: string;
    status: 'pending' | 'approved' | 'oos'; // out-of-spec
    signature_data: string | null; // JSON with signature image and password validation
    created_at: string;
    updated_at: string;
    // Joined fields
    tank?: IntermediateTank;
    production_lot?: ProductionLot;
    product?: Product;
    analyses?: LineAnalysis[];
}

export interface LineAnalysis {
    id: string;
    sample_id: string;
    parameter_id: string;
    value: number;
    lsl: number | null;  // Lower Spec Limit
    target: number | null;
    usl: number | null;  // Upper Spec Limit
    unit: string | null;
    result_status: 'in_spec' | 'out_of_spec';
    created_at: string;
}

// Keep for backward compatibility but mark as deprecated
/** @deprecated Use LineSample and LineAnalysis instead */
export interface FinishedLot {
    id: string;
    intermediate_lot_id: string;
    code: string;
    status: 'quarantine' | 'approved' | 'rejected' | 'released';
    created_at: string;
    line?: string;
    co2?: number;
    brix?: number;
    ph?: number;
    density?: number;
    analyzed_at?: string;
    intermediate_lot?: any;
}

// Keep for backward compatibility but mark as deprecated
/** @deprecated Use IntermediateTank instead */
export interface IntermediateLot {
    id: string;
    production_lot_id: string;
    code: string;
    created_at: string;
    tank?: string;
    brix?: number;
    ph?: number;
    acidity?: number;
    ingredients?: Record<string, any>;
    prepared_at?: string;
    // Lifecycle tracking fields
    status?: 'em_producao' | 'terminado' | 'consumido';
    started_at?: string;
    completed_at?: string;
    consumed_at?: string;
    production_lot?: ProductionLot;
}
