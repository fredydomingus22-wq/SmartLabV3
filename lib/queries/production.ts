import { createClient } from "@/lib/supabase/client";
import { ProductionLot, IntermediateLot, Product } from "@/types/production";

// ============================================================================
// PRODUCTS
// ============================================================================

export async function getProducts() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");

    if (error) throw error;
    return data as Product[];
}

export async function createProduct(product: Omit<Product, "id" | "created_at">) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();

    if (error) throw error;
    return data as Product;
}

// ============================================================================
// PRODUCTION LOTS
// ============================================================================

export async function getProductionLots() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("production_lots")
        .select(`
      *,
      product:products(*)
    `)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ProductionLot[];
}

export async function getActiveProductionLots() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("production_lots")
        .select(`
            *,
            product:products(*)
        `)
        .in("status", ["draft", "on_hold", "active"])
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ProductionLot[];
}

export async function getProductionLotById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("production_lots")
        .select(`
            *,
            product:products(*)
        `)
        .eq("id", id)
        .single();

    if (error) throw error;
    return data as ProductionLot;
}

export async function createProductionLot(lot: Omit<ProductionLot, "id" | "created_at" | "product">) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("production_lots")
        .insert(lot)
        .select()
        .single();

    if (error) throw error;
    return data as ProductionLot;
}

export async function updateProductionLotStatus(id: string, status: ProductionLot["status"]) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("production_lots")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as ProductionLot;
}

// ============================================================================
// PRODUCTION LOTS STATISTICS
// ============================================================================

export interface ProductionLotsStats {
    total_lots: number;
    active_lots: number;
    completed_today: number;
    avg_duration_hours: number | null;
    lots_by_shift: Record<string, number>;
    unique_products: number;
    lots_by_status: Record<string, number>;
}

export async function getProductionLotsStats(): Promise<ProductionLotsStats> {
    const supabase = createClient();

    const { data: lots, error } = await supabase
        .from("production_lots")
        .select(`
            *,
            product:products(id, name)
        `)
        .order("created_at", { ascending: false });

    if (error) throw error;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalLots = lots?.length || 0;
    const activeStatuses = ['active', 'on_hold', 'draft'];
    const closedStatuses = ['completed', 'cancelled'];

    const activeLots = lots?.filter(lot => activeStatuses.includes(lot.status)).length || 0;
    const completedToday = lots?.filter(lot => {
        if (!closedStatuses.includes(lot.status) || !lot.updated_at) return false;
        const updatedDate = new Date(lot.updated_at);
        return updatedDate >= todayStart;
    }).length || 0;

    // Calculate average duration for closed lots
    const closedLots = lots?.filter(lot => closedStatuses.includes(lot.status) && lot.updated_at) || [];
    let avgDurationHours: number | null = null;

    if (closedLots.length > 0) {
        const totalDuration = closedLots.reduce((sum, lot) => {
            const created = new Date(lot.created_at).getTime();
            const closed = new Date(lot.updated_at!).getTime();
            return sum + (closed - created);
        }, 0);
        avgDurationHours = Math.round((totalDuration / closedLots.length) / (1000 * 60 * 60) * 10) / 10;
    }

    // Lots by shift (using shift_id now)
    const lotsByShift: Record<string, number> = {};
    lots?.forEach(lot => {
        const shiftKey = lot.shift_id || 'unassigned';
        lotsByShift[shiftKey] = (lotsByShift[shiftKey] || 0) + 1;
    });

    // Lots by status
    const lotsByStatus: Record<string, number> = {};
    lots?.forEach(lot => {
        lotsByStatus[lot.status] = (lotsByStatus[lot.status] || 0) + 1;
    });

    // Unique products count
    const uniqueProducts = new Set(lots?.map(lot => lot.product_id).filter(Boolean) || []).size;

    return {
        total_lots: totalLots,
        active_lots: activeLots,
        completed_today: completedToday,
        avg_duration_hours: avgDurationHours,
        lots_by_shift: lotsByShift,
        unique_products: uniqueProducts,
        lots_by_status: lotsByStatus
    };
}

// ============================================================================
// INTERMEDIATE LOTS
// ============================================================================

export async function getIntermediateLots() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("intermediate_lots")
        .select(`
            *,
            production_lot:production_lots(
                *,
                product:products(*)
            ),
            tank:mixing_tanks(
                id,
                name,
                code,
                capacity,
                status
            ),
            ingredients:intermediate_lot_ingredients(*)
        `)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as IntermediateLot[];
}

export async function getIntermediateLotsByProductionLot(lotId: string, status?: string) {
    const supabase = createClient();
    let query = supabase
        .from("intermediate_lots")
        .select(`
            *,
            production_lot:production_lots(*),
            tank:mixing_tanks(
                id,
                name,
                code,
                capacity,
                status
            ),
            ingredients:intermediate_lot_ingredients(*)
        `)
        .eq("production_lot_id", lotId);

    if (status) {
        query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data as IntermediateLot[];
}

export async function getIntermediateLotById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("intermediate_lots")
        .select(`
            *,
            production_lot:production_lots(*, product:products(*)),
            tank:mixing_tanks(*),
            ingredients:intermediate_lot_ingredients(*)
        `)
        .eq("id", id)
        .single();

    if (error) throw error;
    return data as IntermediateLot;
}

export async function createIntermediateLot(lot: {
    code: string;
    production_lot_id: string;
    tank_id?: string;
    status?: string;
}) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("intermediate_lots")
        .insert({
            code: lot.code,
            production_lot_id: lot.production_lot_id,
            tank_id: lot.tank_id || null,
            status: lot.status || 'active'
        })
        .select()
        .single();

    if (error) throw error;
    return data as IntermediateLot;
}

export async function updateIntermediateLotStatus(
    id: string, 
    status: 'em_producao' | 'terminado' | 'consumido' | 'active' | 'completed'
) {
    const supabase = createClient();
    const updates: Record<string, unknown> = { 
        status,
        updated_at: new Date().toISOString()
    };
    
    // Set timestamps based on status
    if (status === 'terminado' || status === 'completed') {
        updates.completed_at = new Date().toISOString();
    } else if (status === 'consumido') {
        updates.consumed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
        .from("intermediate_lots")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as IntermediateLot;
}

// ============================================================================
// INTERMEDIATE LOT INGREDIENTS
// ============================================================================

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

export async function addIntermediateLotIngredient(ingredient: Omit<IntermediateLotIngredient, 'id' | 'added_at'>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("intermediate_lot_ingredients")
        .insert(ingredient)
        .select()
        .single();

    if (error) throw error;
    return data as IntermediateLotIngredient;
}

export async function deleteIntermediateLotIngredient(id: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from("intermediate_lot_ingredients")
        .delete()
        .eq("id", id);

    if (error) throw error;
}

export async function getIntermediateLotIngredients(lotId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("intermediate_lot_ingredients")
        .select("*")
        .eq("intermediate_lot_id", lotId)
        .order("added_at", { ascending: true });

    if (error) throw error;
    return data as IntermediateLotIngredient[];
}

// ============================================================================
// FINISHED PRODUCT LOTS
// ============================================================================

export interface FinishedProductLot {
    id: string;
    code: string;
    intermediate_lot_id: string;
    sku?: string;
    status: 'active' | 'released' | 'blocked' | 'quarantine' | 'completed';
    created_at: string;
    updated_at?: string;
    created_by?: string;
    tenant_id?: string;
}

export async function getFinishedProductLots() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("finished_product_lots")
        .select(`
            *,
            intermediate_lot:intermediate_lots(
                *,
                production_lot:production_lots(*, product:products(*))
            )
        `)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

export async function getFinishedProductLotsByIntermediateLot(intermediateLotId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("finished_product_lots")
        .select("*")
        .eq("intermediate_lot_id", intermediateLotId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as FinishedProductLot[];
}

export async function createFinishedProductLot(lot: Omit<FinishedProductLot, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("finished_product_lots")
        .insert(lot)
        .select()
        .single();

    if (error) throw error;
    return data as FinishedProductLot;
}

export async function updateFinishedProductLotStatus(id: string, status: FinishedProductLot['status']) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("finished_product_lots")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as FinishedProductLot;
}

// ============================================================================
// MIXING TANKS (Equipment Registry)
// ============================================================================

export interface MixingTank {
    id: string;
    name: string;
    code: string;
    capacity: number;
    status: 'active' | 'cleaning' | 'maintenance' | 'inactive';
    current_product_id?: string;
    last_cleaned_at?: string;
    created_at: string;
    updated_at?: string;
}

export async function getMixingTanks() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("mixing_tanks")
        .select("*")
        .order("code");

    if (error) throw error;
    return data as MixingTank[];
}

export async function getActiveMixingTanks() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("mixing_tanks")
        .select("*")
        .eq("status", "active")
        .order("code");

    if (error) throw error;
    return data as MixingTank[];
}

export async function createMixingTank(tank: Omit<MixingTank, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("mixing_tanks")
        .insert(tank)
        .select()
        .single();

    if (error) throw error;
    return data as MixingTank;
}

export async function updateMixingTankStatus(id: string, status: MixingTank['status']) {
    const supabase = createClient();
    const updates: Record<string, unknown> = { 
        status,
        updated_at: new Date().toISOString()
    };
    
    if (status === 'active') {
        updates.last_cleaned_at = new Date().toISOString();
    }

    const { data, error } = await supabase
        .from("mixing_tanks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as MixingTank;
}

// ============================================================================
// PRODUCTION LINES
// ============================================================================

export interface ProductionLine {
    id: string;
    name: string;
    code: string;
    status: 'active' | 'maintenance' | 'inactive';
    capacity_per_hour?: number;
    created_at: string;
    updated_at?: string;
}

export async function getProductionLines() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("production_lines")
        .select("*")
        .order("code");

    if (error) throw error;
    return data as ProductionLine[];
}

export async function getActiveProductionLines() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("production_lines")
        .select("*")
        .eq("status", "active")
        .order("code");

    if (error) throw error;
    return data as ProductionLine[];
}

// ============================================================================
// SHIFTS
// ============================================================================

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

export async function getShifts() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .order("start_time");

    if (error) throw error;
    return data as Shift[];
}

export async function getActiveShifts() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .eq("active", true)
        .order("start_time");

    if (error) throw error;
    return data as Shift[];
}
