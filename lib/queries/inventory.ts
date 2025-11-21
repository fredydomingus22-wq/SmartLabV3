import { createClient } from "@/lib/supabase/client";
import { RawMaterial, RawMaterialLot, Supplier } from "@/types/inventory";

export async function getRawMaterials() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("raw_materials")
        .select("*")
        .order("name");

    if (error) throw error;
    return data as RawMaterial[];
}

export async function createRawMaterial(rawMaterial: Omit<RawMaterial, "id" | "created_at">) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("raw_materials")
        .insert(rawMaterial)
        .select()
        .single();

    if (error) throw error;
    return data as RawMaterial;
}

export async function getSuppliers() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");

    if (error) throw error;
    return data as Supplier[];
}

export async function createSupplier(supplier: Omit<Supplier, "id" | "created_at">) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("suppliers")
        .insert(supplier)
        .select()
        .single();

    if (error) throw error;
    return data as Supplier;
}

export async function getRawMaterialLots() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("raw_material_lots")
        .select(`
      *,
      raw_material:raw_materials(*)
    `)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as RawMaterialLot[];
}

export async function createRawMaterialLot(lot: Omit<RawMaterialLot, "id" | "created_at" | "raw_material">) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("raw_material_lots")
        .insert(lot)
        .select()
        .single();

    if (error) throw error;
    return data as RawMaterialLot;
}
