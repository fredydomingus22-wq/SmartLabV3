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
