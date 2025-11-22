import { createClient } from "@/lib/supabase/client";
import { NonConformity, EightDReport } from "@/types/qms";

export async function getNCs() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("non_conformities")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as NonConformity[];
}

export async function createNC(nc: Omit<NonConformity, "id" | "created_at">) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("non_conformities")
        .insert(nc)
        .select()
        .single();

    if (error) throw error;
    return data as NonConformity;
}

export async function updateNC(id: string, updates: Partial<NonConformity>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("non_conformities")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as NonConformity;
}

export async function getEightDReports() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("eight_d_reports")
        .select("*, nc:non_conformities(code)")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as EightDReport[];
}

export async function createEightDReport(report: Omit<EightDReport, "id" | "created_at">) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("eight_d_reports")
        .insert(report)
        .select()
        .single();

    if (error) throw error;
    return data as EightDReport;
}

export async function updateEightDReport(id: string, updates: Partial<EightDReport>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("eight_d_reports")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as EightDReport;
}
