export interface RawMaterial {
    id: string;
    name: string;
    code: string | null;
    created_at: string;
}

export interface RawMaterialLot {
    id: string;
    raw_material_id: string;
    lot_code: string;
    status: 'pending' | 'approved' | 'rejected' | 'quarantine';
    created_at: string;
    // Joined fields
    raw_material?: RawMaterial;
}

export interface Supplier {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'blocked';
    created_at: string;
}
