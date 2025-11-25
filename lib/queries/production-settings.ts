import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// ==========================================
// TYPES
// ==========================================

export interface ProductionLine {
    id: string;
    name: string;
    code: string;
    status: 'active' | 'maintenance' | 'inactive';
    capacity_per_hour?: number;
    created_at: string;
}

export interface MixingTank {
    id: string;
    name: string;
    code: string;
    capacity: number;
    status: 'active' | 'cleaning' | 'maintenance' | 'inactive';
    current_product_id?: string;
    last_cleaned_at?: string;
    created_at: string;
}

export interface Shift {
    id: string;
    name: string;
    code?: string;
    start_time: string;
    end_time: string;
    active: boolean;
    created_at: string;
}

// ==========================================
// PRODUCTION LINES QUERIES
// ==========================================

export async function getProductionLines() {
    const { data, error } = await supabase
        .from('production_lines')
        .select('*')
        .order('name');
    return { data: data as ProductionLine[] | null, error };
}

export async function createProductionLine(line: Partial<ProductionLine>) {
    const { data, error } = await supabase
        .from('production_lines')
        .insert(line)
        .select()
        .single();
    return { data: data as ProductionLine | null, error };
}

export async function updateProductionLine(id: string, updates: Partial<ProductionLine>) {
    const { data, error } = await supabase
        .from('production_lines')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    return { data: data as ProductionLine | null, error };
}

export async function deleteProductionLine(id: string) {
    const { error } = await supabase
        .from('production_lines')
        .delete()
        .eq('id', id);
    return { error };
}

// ==========================================
// MIXING TANKS QUERIES
// ==========================================

export async function getMixingTanks() {
    const { data, error } = await supabase
        .from('mixing_tanks')
        .select('*, products(name)')
        .order('name');
    return { data: data as any[] | null, error };
}

export async function createMixingTank(tank: Partial<MixingTank>) {
    const { data, error } = await supabase
        .from('mixing_tanks')
        .insert(tank)
        .select()
        .single();
    return { data: data as MixingTank | null, error };
}

export async function updateMixingTank(id: string, updates: Partial<MixingTank>) {
    const { data, error } = await supabase
        .from('mixing_tanks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    return { data: data as MixingTank | null, error };
}

export async function deleteMixingTank(id: string) {
    const { error } = await supabase
        .from('mixing_tanks')
        .delete()
        .eq('id', id);
    return { error };
}

// ==========================================
// SHIFTS QUERIES
// ==========================================

export async function getShifts() {
    const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time');
    return { data: data as Shift[] | null, error };
}

export async function createShift(shift: Partial<Shift>) {
    const { data, error } = await supabase
        .from('shifts')
        .insert(shift)
        .select()
        .single();
    return { data: data as Shift | null, error };
}

export async function updateShift(id: string, updates: Partial<Shift>) {
    const { data, error } = await supabase
        .from('shifts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    return { data: data as Shift | null, error };
}

export async function deleteShift(id: string) {
    const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id);
    return { error };
}

// ==========================================
// CIP RECORDS QUERIES
// ==========================================

export interface CipRecord {
    id: string;
    equipment_id: string;
    tank_id?: string;
    line_id?: string;
    shift_id?: string;
    cleaning_type?: string;
    start_time: string;
    end_time?: string;
    performed_by: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    notes?: string;
    created_at: string;
}

export async function getCipRecords() {
    const { data, error } = await supabase
        .from('cip_records')
        .select('*')
        .order('start_time', { ascending: false });
    return { data: data as CipRecord[] | null, error };
}

export async function createCipRecord(record: Partial<CipRecord>) {
    const { data, error } = await supabase
        .from('cip_records')
        .insert(record)
        .select()
        .single();
    return { data: data as CipRecord | null, error };
}

export async function updateCipRecord(id: string, updates: Partial<CipRecord>) {
    const { data, error } = await supabase
        .from('cip_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    return { data: data as CipRecord | null, error };
}

export async function deleteCipRecord(id: string) {
    const { error } = await supabase
        .from('cip_records')
        .delete()
        .eq('id', id);
    return { error };
}
