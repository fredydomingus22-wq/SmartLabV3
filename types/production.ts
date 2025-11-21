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
    // New optional fields per schema
    factory_id?: string;
    production_line?: string;
    shift?: string;
    start_time?: string;
    end_time?: string;
    created_by?: string;
    // Joined fields
    product?: Product;
}

export interface IntermediateLot {
    id: string;
    production_lot_id: string;
    code: string;
    created_at: string;
    // New optional fields per schema
    tank?: string;
    brix?: number;
    ph?: number;
    acidity?: number;
    ingredients?: any;
    prepared_at?: string;
    status?: string;
    // Joined fields
    production_lot?: ProductionLot;
}

export interface FinishedLot {
    id: string;
    intermediate_lot_id: string;
    code: string;
    status: 'quarantine' | 'approved' | 'rejected' | 'released';
    created_at: string;
    // New optional fields per schema
    line?: string;
    co2?: number;
    brix?: number;
    ph?: number;
    density?: number;
    analyzed_at?: string;
    // Joined fields
    intermediate_lot?: IntermediateLot;
}
