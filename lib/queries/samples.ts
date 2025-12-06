import { createClient } from "@/lib/supabase/client";
import { SAMPLE_STATUS, type SampleStatus } from "@/lib/constants/status";

export interface SampleListItem {
    id: string;
    code: string;
    status: SampleStatus;
    sample_type?: { code: string; name: string };
    collected_at: string | null;
    product?: { name: string; sku?: string };
    tank?: { code: string; name?: string };
    production_lot?: { code: string };
    assigned_to?: string | null;
    assigned_user?: { id: string; full_name?: string } | null;
    intermediate_lot?: { code: string };
    finished_product_lot?: { code: string };
}

export interface SampleListFilters {
    status?: SampleStatus;
    assignedTo?: string;
    limit?: number;
}

export async function getSamples(filters: SampleListFilters = {}): Promise<SampleListItem[]> {
    const supabase = createClient();

    let query = supabase
        .from("samples")
        .select(
            `
            id,
            code,
            status,
            collected_at,
            assigned_to,
            assigned_user:profiles!samples_assigned_to_fkey(id, full_name),
            sample_types:sample_types(code, name),
            products:products(name, sku),
            tanks:tanks(code, name),
            production_lots:production_lots(code),
            intermediate_lots:intermediate_lots(code),
            finished_product_lots:finished_product_lots(code)
        `
        )
        .order("collected_at", { ascending: false });

    if (filters.status) {
        query = query.eq("status", filters.status);
    }

    if (filters.assignedTo) {
        query = query.eq("assigned_to", filters.assignedTo);
    }

    if (filters.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    const samples: SampleListItem[] = data.map((sample: any) => ({
        id: sample.id,
        code: sample.code,
        status: sample.status as SampleStatus,
        sample_type: sample.sample_types || undefined,
        collected_at: sample.collected_at,
        product: sample.products || undefined,
        tank: sample.tanks || undefined,
        production_lot: sample.production_lots || undefined,
        intermediate_lot: sample.intermediate_lots || undefined,
        finished_product_lot: sample.finished_product_lots || undefined,
        assigned_to: sample.assigned_to,
        assigned_user: sample.assigned_user || null
    }));

    return samples;
}

export async function assignAnalyst(sampleId: string, analystId: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from("samples")
        .update({ assigned_to: analystId })
        .eq("id", sampleId);

    if (error) throw error;
}

export async function updateSampleStatus(
    sampleId: string,
    status: SampleStatus,
    comment?: string
) {
    const supabase = createClient();
    const { error } = await supabase
        .from("samples")
        .update({ status })
        .eq("id", sampleId);
    if (error) throw error;
}

export async function getTechnicians() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("role", "technician")
        .order("full_name", { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function getMyAssignedSamples(userId: string) {
    return getSamples({ assignedTo: userId, status: SAMPLE_STATUS.IN_ANALYSIS });
}
