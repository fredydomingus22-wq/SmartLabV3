"use client"

import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// ==============================
// Types
// ==============================
export interface CipRecord {
    id: string;
    tank_id?: string;
    line_id?: string;
    shift_id?: string;
    start_time: string;
    end_time?: string;
    cleaning_type?: string;
    status: 'pending' | 'in_progress' | 'completed';
    notes?: string;
    created_at: string;
}

export interface CipStep {
    id: string;
    cip_record_id: string;
    step_number: number;
    equipment_id?: string;
    chemical_concentration?: string;
    duration_minutes?: number;
    water_ph?: number;
    technician_signature?: string;
    start_time: string;
    end_time?: string;
    notes?: string;
    created_at: string;
}

export interface Equipment {
    id: string;
    name: string;
    code: string;
    type?: string;
    status: 'active' | 'maintenance' | 'inactive';
    created_at: string;
}

// ==============================
// CIP Records CRUD
// ==============================
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
    const { error } = await supabase.from('cip_records').delete().eq('id', id);
    return { error };
}

// ==============================
// CIP Steps CRUD
// ==============================
export async function getCipSteps(cipRecordId: string) {
    const { data, error } = await supabase
        .from('cip_steps')
        .select('*')
        .eq('cip_record_id', cipRecordId)
        .order('step_number');
    return { data: data as CipStep[] | null, error };
}

export async function createCipStep(step: Partial<CipStep>) {
    const { data, error } = await supabase
        .from('cip_steps')
        .insert(step)
        .select()
        .single();
    return { data: data as CipStep | null, error };
}

export async function updateCipStep(id: string, updates: Partial<CipStep>) {
    const { data, error } = await supabase
        .from('cip_steps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    return { data: data as CipStep | null, error };
}

export async function deleteCipStep(id: string) {
    const { error } = await supabase.from('cip_steps').delete().eq('id', id);
    return { error };
}

// ==============================
// Equipment CRUD (reuse existing table)
// ==============================
export async function getEquipment() {
    const { data, error } = await supabase.from('equipment').select('*').order('name');
    return { data: data as Equipment[] | null, error };
}

export async function createEquipment(eq: Partial<Equipment>) {
    const { data, error } = await supabase.from('equipment').insert(eq).select().single();
    return { data: data as Equipment | null, error };
}

export async function updateEquipment(id: string, updates: Partial<Equipment>) {
    const { data, error } = await supabase.from('equipment').update(updates).eq('id', id).select().single();
    return { data: data as Equipment | null, error };
}

export async function deleteEquipment(id: string) {
    const { error } = await supabase.from('equipment').delete().eq('id', id);
    return { error };
}
