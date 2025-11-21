import { createClient } from "@/lib/supabase/client";
import { ProductionLot, IntermediateLot, FinishedLot, Product } from "@/types/production";

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
// INTERMEDIATE LOTS
// ============================================================================

export async function getIntermediateLots() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("intermediate_lots")
        .select(`
      *,
      production_lot:production_lots(*, product:products(*))
    `)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as IntermediateLot[];
}

export async function createIntermediateLot(lot: Omit<IntermediateLot, "id" | "created_at" | "production_lot">) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("intermediate_lots")
        .insert(lot)
        .select()
        .single();

    if (error) throw error;
    return data as IntermediateLot;
}

// ============================================================================
// FINISHED LOTS
// ============================================================================

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
