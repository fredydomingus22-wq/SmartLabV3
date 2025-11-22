export interface RawMaterial {
    id: string;
    name: string;
    code: string | null;
    min_stock_level?: number;
    created_at: string;
}

export interface RawMaterialLot {
    id: string;
    raw_material_id: string;
    lot_code: string;
    status: 'pending' | 'approved' | 'rejected' | 'quarantine';
    quantity?: number;
    unit?: string;
    received_date?: string;
    created_at: string;
    // Joined fields
    raw_material?: RawMaterial;
}

export interface StockMovement {
    id: string;
    item_type: 'raw_material' | 'finished_good';
    item_id: string;
    lot_id: string;
    quantity_change: number;
    reason: string;
    performed_by: string;
    created_at: string;
}

export interface Supplier {
    id: string;
    name: string;
    type: string;
    auditor_id?: string;
    status: 'planned' | 'active' | 'inactive' | 'blocked';
    qualification_status?: 'pending' | 'qualified' | 'disqualified';
    rating?: number;
    scheduled_date?: string;
    created_at: string;
}
