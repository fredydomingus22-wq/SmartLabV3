import { createClient } from "@/lib/supabase/client";
import { ProductionLot, IntermediateTank, LineSample, LineAnalysis, Product, FinishedLot, IntermediateLot } from "@/types/production";

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
        .update({ status })
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

    // Get all production lots with product info
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

    // Calculate stats
    const totalLots = lots?.length || 0;
    const activeLots = lots?.filter(lot => lot.status === 'open').length || 0;
    const completedToday = lots?.filter(lot => {
        if (lot.status !== 'closed' || !lot.updated_at) return false;
        const updatedDate = new Date(lot.updated_at);
        return updatedDate >= todayStart;
    }).length || 0;

    // Calculate average duration for closed lots
    const closedLots = lots?.filter(lot => lot.status === 'closed' && lot.updated_at) || [];
    let avgDurationHours: number | null = null;

    if (closedLots.length > 0) {
        const totalDuration = closedLots.reduce((sum, lot) => {
            const created = new Date(lot.created_at).getTime();
            const closed = new Date(lot.updated_at!).getTime();
            return sum + (closed - created);
        }, 0);
        avgDurationHours = Math.round((totalDuration / closedLots.length) / (1000 * 60 * 60) * 10) / 10;
    }

    // Lots by shift
    const lotsByShift: Record<string, number> = {};
    lots?.forEach(lot => {
        if (lot.shift) {
            lotsByShift[lot.shift] = (lotsByShift[lot.shift] || 0) + 1;
        }
    });

    // Lots by status
    const lotsByStatus: Record<string, number> = {};
    lots?.forEach(lot => {
        lotsByStatus[lot.status] = (lotsByStatus[lot.status] || 0) + 1;
    });

    // Unique products count
    const uniqueProducts = new Set(lots?.map(lot => lot.product_id) || []).size;

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
// INTERMEDIATE TANKS (renamed from INTERMEDIATE LOTS)
// ============================================================================
// NOTE: These functions use the old 'intermediate_tanks' table.
// For new implementations, use getIntermediateLots() from the 'intermediate_lots' table.

/** @deprecated Use getIntermediateLots() for new implementations. This uses the old intermediate_tanks table. */
export async function getTanks() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("intermediate_tanks")
        .select(`
      *,
      production_lot:production_lots(*, product:products(*))
    `)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as IntermediateTank[];
}

/** @deprecated Use getIntermediateLots() with filtering for new implementations. */
export async function getTanksByProductionLot(lotId: string, status?: 'active' | 'finished') {
    const supabase = createClient();
    let query = supabase
        .from("intermediate_tanks")
        .select(`
      *,
      production_lot:production_lots(*, product:products(*))
    `)
        .eq("production_lot_id", lotId);

    if (status) {
        query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data as IntermediateTank[];
}

/** @deprecated Old tank system. Consider migrating to intermediate_lots table. */
export async function getTankById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("intermediate_tanks")
        .select(`
      *,
      production_lot:production_lots(*, product:products(*))
    `)
        .eq("id", id)
        .single();

    if (error) throw error;
    return data as IntermediateTank;
}

/** @deprecated Use the new intermediate lots creation workflow (/intermediate-lots/create). */
export async function createTank(tank: Omit<IntermediateTank, "id" | "created_at" | "production_lot">) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("intermediate_tanks")
        .insert(tank)
        .select()
        .single();

    if (error) throw error;
    return data as IntermediateTank;
}

/** @deprecated Use StateChangeDialog for intermediate lots status updates. */
export async function updateTankStatus(id: string, status: 'active' | 'finished', endAt?: string) {
    const supabase = createClient();
    const updates: any = { status };
    if (endAt) {
        updates.end_at = endAt;
    }

    const { data, error } = await supabase
        .from("intermediate_tanks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as IntermediateTank;
}

// ============================================================================
// LINE SAMPLES (replaces FINISHED LOTS concept)
// ============================================================================

export async function getLineSamples(tankId?: string) {
    const supabase = createClient();
    let query = supabase
        .from("line_samples")
        .select(`
      *,
      tank:intermediate_tanks(*),
      production_lot:production_lots(*),
      product:products(*),
      analyses:line_analysis(*, parameter:parameters(*))
    `);

    if (tankId) {
        query = query.eq("tank_id", tankId);
    }

    const { data, error } = await query.order("sample_time", { ascending: false });

    if (error) throw error;
    return data as LineSample[];
}

export async function getLineSampleById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("line_samples")
        .select(`
      *,
      tank:intermediate_tanks(*, production_lot:production_lots(*, product:products(*))),
      production_lot:production_lots(*),
      product:products(*),
      analyses:line_analysis(*, parameter:parameters(*))
    `)
        .eq("id", id)
        .single();

    if (error) throw error;
    return data as LineSample;
}

export async function createLineSampleWithAnalysis(data: {
    tank_id: string;
    production_lot_id: string;
    product_id: string;
    sample_time: string;
    collected_by: string;
    signature_data?: string;
    analyses: Array<{
        parameter_id: string;
        value: number;
        lsl?: number;
        target?: number;
        usl?: number;
        unit?: string;
    }>;
}) {
    const supabase = createClient();

    // Calculate overall status based on analyses
    const hasOOS = data.analyses.some(a => {
        if (a.lsl !== undefined && a.value < a.lsl) return true;
        if (a.usl !== undefined && a.value > a.usl) return true;
        return false;
    });
    const status = hasOOS ? 'oos' : 'pending';

    // Create the line sample
    const { data: sample, error: sampleError } = await supabase
        .from("line_samples")
        .insert({
            tank_id: data.tank_id,
            production_lot_id: data.production_lot_id,
            product_id: data.product_id,
            sample_time: data.sample_time,
            collected_by: data.collected_by,
            signature_data: data.signature_data || null,
            status
        })
        .select()
        .single();

    if (sampleError) throw sampleError;

    // Create line analyses
    const analyses = data.analyses.map(a => {
        const result_status: 'in_spec' | 'out_of_spec' =
            (a.lsl !== undefined && a.value < a.lsl) ||
                (a.usl !== undefined && a.value > a.usl)
                ? 'out_of_spec'
                : 'in_spec';

        return {
            sample_id: sample.id,
            parameter_id: a.parameter_id,
            value: a.value,
            lsl: a.lsl ?? null,
            target: a.target ?? null,
            usl: a.usl ?? null,
            unit: a.unit ?? null,
            result_status
        };
    });

    const { error: analysesError } = await supabase
        .from("line_analysis")
        .insert(analyses);

    if (analysesError) throw analysesError;

    // Also record in product_tests for unified history
    const productTests = data.analyses.map(a => {
        const result_status: 'in_spec' | 'out_of_spec' =
            (a.lsl !== undefined && a.value < a.lsl) ||
                (a.usl !== undefined && a.value > a.usl)
                ? 'out_of_spec'
                : 'in_spec';

        return {
            product_id: data.product_id,
            production_lot_id: data.production_lot_id,
            tank_id: data.tank_id,
            sample_id: sample.id,
            parameter_id: a.parameter_id,
            measured_value: a.value,
            spec_min: a.lsl ?? null,
            spec_target: a.target ?? null,
            spec_max: a.usl ?? null,
            unit: a.unit ?? null,
            result_status,
            test_level: 'line', // Line analysis is considered 'line' level
            tested_by: data.collected_by,
            tested_at: data.sample_time
        };
    });

    const { error: testsError } = await supabase
        .from("product_tests")
        .insert(productTests);

    if (testsError) {
        console.error("Error creating product tests:", testsError);
        // We don't throw here to avoid failing the whole transaction if just the history fails
        // But in a real production app we might want to ensure consistency
    }

    return sample as LineSample;
}

export async function updateLineSampleStatus(id: string, status: LineSample["status"]) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("line_samples")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as LineSample;
}

// ============================================================================
// LINE ANALYSIS
// ============================================================================

export async function getLineAnalysesBySample(sampleId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("line_analysis")
        .select(`
      *,
      parameter:parameters(*)
    `)
        .eq("sample_id", sampleId)
        .order("created_at", { ascending: true });

    if (error) throw error;
    return data as LineAnalysis[];
}

// ============================================================================
// DEPRECATED - BACKWARD COMPATIBILITY
// ============================================================================

/** @deprecated Use getTanks() instead */
export async function getIntermediateLots() {
    return getTanks() as Promise<any[]>;
}

/** @deprecated Use createTank() instead */
export async function createIntermediateLot(lot: any) {
    return createTank(lot) as Promise<any>;
}

/** @deprecated Use getLineSamples() instead */
export async function getFinishedLots() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("finished_lots")
        .select(`
      *,
      intermediate_lot:intermediate_lots(*, production_lot:production_lots(*, product:products(*)))
    `)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as FinishedLot[];
}

/** @deprecated Use createLineSampleWithAnalysis() instead */
export async function createFinishedLot(lot: Omit<FinishedLot, "id" | "created_at" | "intermediate_lot">) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("finished_lots")
        .insert(lot)
        .select()
        .single();

    if (error) throw error;
    return data as FinishedLot;
}

/** @deprecated Use updateLineSampleStatus() instead */
export async function updateFinishedLotStatus(id: string, status: FinishedLot["status"]) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("finished_lots")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as FinishedLot;
}

