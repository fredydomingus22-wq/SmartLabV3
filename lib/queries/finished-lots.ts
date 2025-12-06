import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";

export type FinishedProductLot = Database["public"]["Tables"]["finished_product_lots"]["Row"] & {
    intermediate_lot?: {
        code: string;
        production_lot?: {
            code: string;
            product?: {
                name: string;
            };
        };
    };
};

export async function getFinishedLots() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("finished_product_lots")
        .select(`
            *,
            intermediate_lot:intermediate_lots(
                code,
                production_lot:production_lots(
                    code,
                    product:products(name)
                )
            )
        `)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as FinishedProductLot[];
}

export async function createFinishedLot(data: Database["public"]["Tables"]["finished_product_lots"]["Insert"]) {
    const supabase = createClient();
    const { data: newLot, error } = await supabase
        .from("finished_product_lots")
        .insert(data)
        .select()
        .single();

    if (error) throw error;
    return newLot;
}

export async function updateFinishedLotStatus(id: string, status: FinishedProductLot["status"]) {
    const supabase = createClient();
    const { error } = await supabase
        .from("finished_product_lots")
        .update({ status })
        .eq("id", id);

    if (error) throw error;
}
