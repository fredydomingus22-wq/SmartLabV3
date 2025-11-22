import { createClient } from "@/lib/supabase/client";
import { Equipment } from "@/types/equipment";

export async function getEquipment() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .order("name");

    if (error) throw error;
    return data as Equipment[];
}

export async function getEquipmentById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;
    return data as Equipment;
}

export async function createEquipment(equipment: Omit<Equipment, 'id' | 'created_at'>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("equipment")
        .insert(equipment)
        .select()
        .single();

    if (error) throw error;
    return data as Equipment;
}

export async function updateEquipment(id: string, updates: Partial<Equipment>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("equipment")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as Equipment;
}

export async function getCalibrationDueEquipment() {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .lte("calibration_due", today)
        .eq("status", "active")
        .order("calibration_due");

    if (error) throw error;
    return data as Equipment[];
}
