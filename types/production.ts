// =============================================================================
// PRODUCTION MODULE TYPES - SmartLab V3
// Clean structure aligned with database schema after cleanup migration
// =============================================================================

// -----------------------------------------------------------------------------
// PRODUCTS
// -----------------------------------------------------------------------------

export interface Product {
    id: string;
    name: string;
    sku: string;
    description: string | null;
    created_at: string;
}

// -----------------------------------------------------------------------------
// PRODUCTION LOTS (Lote Pai)
// -----------------------------------------------------------------------------

export type ProductionLotStatus =
    | 'draft'       // Aguardando ordem
    | 'active'      // Em produção
    | 'on_hold'     // Em espera
    | 'completed'   // Concluído
    | 'cancelled';  // Cancelado

export interface ProductionLot {
    id: string;
    code: string;
    product_id: string;
    factory_id?: string | null;
    production_line_id?: string | null;
    shift_id?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    status: ProductionLotStatus;
    created_by?: string | null;
    created_at: string;
    updated_at?: string | null;
    updated_by?: string | null;
    tenant_id?: string | null;
    source_tank_id?: string | null;
    // Joined
    product?: Product;
}

// -----------------------------------------------------------------------------
// INTERMEDIATE LOTS (Lote Intermédio / Tanque)
// -----------------------------------------------------------------------------

export type IntermediateLotStatus =
    | 'em_producao' // In production (Portuguese legacy)
    | 'terminado'   // Finished
    | 'consumido'   // Consumed
    | 'active'      // Active (English)
    | 'completed';  // Completed (English)

export interface IntermediateLot {
    id: string;
    code: string;
    production_lot_id: string | null;
    tank_id: string | null;
    status: IntermediateLotStatus;
    created_at: string;
    updated_at?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    consumed_at?: string | null;
    tenant_id?: string | null;
    // Joined
    production_lot?: ProductionLot;
    tank?: MixingTank;
    ingredients?: IntermediateLotIngredient[];
}

export interface IntermediateLotIngredient {
    id: string;
    intermediate_lot_id: string;
    raw_material_id?: string;
    raw_material_name: string;
    lot_number?: string;
    expiry_date?: string;
    quantity_used: number;
    unit: string;
    added_at: string;
    added_by?: string;
    notes?: string;
}

// -----------------------------------------------------------------------------
// FINISHED PRODUCT LOTS (Lote Final / Produto Acabado)
// -----------------------------------------------------------------------------

export type FinishedProductLotStatus =
    | 'active'
    | 'released'
    | 'blocked'
    | 'quarantine'
    | 'completed';

export interface FinishedProductLot {
    id: string;
    code: string;
    intermediate_lot_id: string;
    sku?: string;
    status: FinishedProductLotStatus;
    created_at: string;
    updated_at?: string | null;
    created_by?: string | null;
    tenant_id?: string | null;
    // Joined
    intermediate_lot?: IntermediateLot;
}

// -----------------------------------------------------------------------------
// MIXING TANKS (Equipment Registry)
// -----------------------------------------------------------------------------

export type MixingTankStatus =
    | 'active'
    | 'cleaning'
    | 'maintenance'
    | 'inactive';

export interface MixingTank {
    id: string;
    name: string;
    code: string;
    capacity: number;
    status: MixingTankStatus;
    current_product_id?: string;
    last_cleaned_at?: string;
    created_at: string;
    updated_at?: string;
}

// -----------------------------------------------------------------------------
// PRODUCTION LINES
// -----------------------------------------------------------------------------

export type ProductionLineStatus =
    | 'active'
    | 'maintenance'
    | 'inactive';

export interface ProductionLine {
    id: string;
    name: string;
    code: string;
    status: ProductionLineStatus;
    capacity_per_hour?: number;
    created_at: string;
    updated_at?: string;
}

// -----------------------------------------------------------------------------
// SHIFTS
// -----------------------------------------------------------------------------

export interface Shift {
    id: string;
    name: string;
    code?: string;
    start_time: string;
    end_time: string;
    active: boolean;
    created_at: string;
    updated_at?: string;
}
