import { createClient } from "@/lib/supabase/client";
import { Sample } from "@/types/lims";

export async function getSamples() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("samples")
        .select(`
            *,
            production_lot:production_lots(code),
            raw_material_lot:raw_material_lots(lot_code)
        `)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Sample[];
}

export async function createSample(sample: Omit<Sample, "id" | "created_at">) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("samples")
        .insert(sample)
        .select()
        .single();

    if (error) throw error;
    return data as Sample;
}

export async function getSampleById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("samples")
        .select(`
            *,
            production_lot:production_lots(*),
            raw_material_lot:raw_material_lots(*)
        `)
        .eq("id", id)
        .single();

    if (error) throw error;
    return data as Sample;
}

export async function updateSampleStatus(id: string, status: Sample["status"]) {
    const supabase = createClient();
    const { error } = await supabase
        .from("samples")
        .update({ status })
        .eq("id", id);

    if (error) throw error;
}

export interface SampleFilters {
    limit?: number;
    status?: string;
    lotId?: string;
    search?: string;
}

export async function getRecentSamples(filters: SampleFilters = {}) {
    const supabase = createClient();
    let query = supabase
        .from("samples")
        .select(`
            id,
            code,
            status,
            sample_type,
            collected_at,
            created_at,
            assigned_to,
            production_lot:production_lots(code, product:products(name, sku))
        `)
        .order("created_at", { ascending: false });

    if (filters.limit) {
        query = query.limit(filters.limit);
    }

    if (filters.status) {
        query = query.eq("status", filters.status);
    }

    if (filters.lotId) {
        query = query.eq("production_lot_id", filters.lotId);
    }

    if (filters.search) {
        query = query.ilike("code", `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
}
