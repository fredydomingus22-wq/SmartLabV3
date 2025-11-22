import { createClient } from "@/lib/supabase/client";
import { Reagent, ReagentBatch, ReagentUsage, ReagentWithStock } from "@/types/reagent";

// ============================================================================
// REAGENTS
// ============================================================================

export async function getReagents(): Promise<ReagentWithStock[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagents")
        .select(`
            *,
            batches:reagent_batches(count),
            supplier:suppliers(name)
        `)
        .order("name");

    if (error) throw error;

    // Calculate stock status
    return (data as any[]).map(r => ({
        ...r,
        total_batches: r.batches?.[0]?.count || 0,
        low_stock: r.stock_current <= r.stock_min,
    }));
}

export async function getReagentById(id: string): Promise<ReagentWithStock> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagents")
        .select(`
            *,
            batches:reagent_batches(*),
            supplier:suppliers(name, contact)
        `)
        .eq("id", id)
        .single();

    if (error) throw error;

    // Count expiring soon (within 30 days)
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 30);

    return {
        ...data,
        expiring_soon_count: data.batches?.filter((b: ReagentBatch) =>
            b.expiration_date && new Date(b.expiration_date) <= expiringDate
        ).length || 0
    };
}

export async function createReagent(reagent: Omit<Reagent, "id" | "created_at" | "updated_at">) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagents")
        .insert(reagent)
        .select()
        .single();

    if (error) throw error;
    return data as Reagent;
}

export async function updateReagent(id: string, updates: Partial<Reagent>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as Reagent;
}

export async function deleteReagent(id: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from("reagents")
        .delete()
        .eq("id", id);

    if (error) throw error;
}

// ============================================================================
// BATCHES
// ============================================================================

export async function getBatchesByReagent(reagentId: string): Promise<ReagentBatch[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagent_batches")
        .select("*")
        .eq("reagent_id", reagentId)
        .order("expiration_date", { ascending: true });

    if (error) throw error;
    return data as ReagentBatch[];
}

export async function createBatch(batch: Omit<ReagentBatch, "id" | "created_at" | "updated_at">) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagent_batches")
        .insert(batch)
        .select()
        .single();

    if (error) throw error;

    // Update reagent stock
    await updateReagentStock(batch.reagent_id);

    return data as ReagentBatch;
}

export async function updateBatch(id: string, updates: Partial<ReagentBatch>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagent_batches")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    // Update reagent stock
    if (data) await updateReagentStock(data.reagent_id);

    return data as ReagentBatch;
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

export async function recordUsage(usage: Omit<ReagentUsage, "id" | "created_at">) {
    const supabase = createClient();

    // Insert usage record
    const { data, error } = await supabase
        .from("reagent_usage")
        .insert(usage)
        .select()
        .single();

    if (error) throw error;

    // Update batch quantity if batch_id provided
    if (usage.batch_id) {
        const { data: batch } = await supabase
            .from("reagent_batches")
            .select("quantity_remaining, reagent_id")
            .eq("id", usage.batch_id)
            .single();

        if (batch) {
            await supabase
                .from("reagent_batches")
                .update({
                    quantity_remaining: batch.quantity_remaining - usage.quantity_used
                })
                .eq("id", usage.batch_id);

            await updateReagentStock(batch.reagent_id);
        }
    }

    return data as ReagentUsage;
}

export async function getUsageHistory(reagentId: string, limit = 50): Promise<ReagentUsage[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagent_usage")
        .select(`
            *,
            user:profiles!used_by(full_name),
            batch:reagent_batches(batch_number)
        `)
        .eq("reagent_id", reagentId)
        .order("used_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data as ReagentUsage[];
}

// ============================================================================
// STOCK MANAGEMENT
// ============================================================================

async function updateReagentStock(reagentId: string) {
    const supabase = createClient();

    // Calculate total stock from all approved batches
    const { data: batches } = await supabase
        .from("reagent_batches")
        .select("quantity_remaining")
        .eq("reagent_id", reagentId)
        .eq("qc_status", "approved");

    const totalStock = batches?.reduce((sum, b) => sum + (b.quantity_remaining || 0), 0) || 0;

    await supabase
        .from("reagents")
        .update({ stock_current: totalStock })
        .eq("id", reagentId);
}

export async function getLowStockReagents(): Promise<ReagentWithStock[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagents")
        .select("*")
        .lte("stock_current", "stock_min")
        .eq("status", "active")
        .order("stock_current", { ascending: true });

    if (error) throw error;
    return data as ReagentWithStock[];
}

export async function getExpiringBatches(days = 30): Promise<ReagentBatch[]> {
    const supabase = createClient();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
        .from("reagent_batches")
        .select(`
            *,
            reagent:reagents(name, code)
        `)
        .lte("expiration_date", futureDate.toISOString().split('T')[0])
        .eq("qc_status", "approved")
        .order("expiration_date", { ascending: true });

    if (error) throw error;
    return data as ReagentBatch[];
}
