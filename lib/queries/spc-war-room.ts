import { createClient } from "@/lib/supabase/client";
import { SPCDataPoint, SpcAlert, SpcChartConfig, SpcMeasurement, SpcPrediction } from "@/types/spc";

type MeasurementFilters = {
    parameterId?: string;
    line?: string;
    productId?: string;
    since?: string;
};

export async function fetchSpcMeasurements(filters: MeasurementFilters = {}): Promise<SPCDataPoint[]> {
    const supabase = createClient();
    let query = supabase.from("spc_measurements").select("*").order("measured_at", { ascending: true });

    if (filters.parameterId) query = query.eq("parameter_id", filters.parameterId);
    if (filters.line) query = query.eq("line", filters.line);
    if (filters.productId) query = query.eq("product_id", filters.productId);
    if (filters.since) query = query.gte("measured_at", filters.since);

    const { data, error } = await query;
    if (error) throw error;

    return (data ?? []).map((row: SpcMeasurement) => ({
        id: row.id,
        value: row.value,
        timestamp: row.measured_at,
        label: row.line ?? row.production_lot_id ?? row.id
    }));
}

export async function fetchSpcChartConfig(parameterId?: string): Promise<SpcChartConfig | null> {
    const supabase = createClient();
    let query = supabase.from("spc_charts").select("*").eq("is_active", true).limit(1);
    if (parameterId) query = query.eq("parameter_id", parameterId);

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data as SpcChartConfig | null;
}

export async function fetchOpenSpcAlerts(): Promise<SpcAlert[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("spc_alerts")
        .select("*")
        .eq("status", "open")
        .order("triggered_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as SpcAlert[];
}

export async function acknowledgeSpcAlert(alertId: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from("spc_alerts")
        .update({ status: "acknowledged", resolved_at: new Date().toISOString() })
        .eq("id", alertId);
    if (error) throw error;
}

export async function closeSpcAlert(alertId: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from("spc_alerts")
        .update({ status: "closed", resolved_at: new Date().toISOString() })
        .eq("id", alertId);
    if (error) throw error;
}

export async function saveSpcPredictions(predictions: SpcPrediction[], parameterId?: string) {
    if (predictions.length === 0) return;
    const supabase = createClient();
    const rows = predictions.map((p) => ({
        ...p,
        parameter_id: parameterId ?? p.parameter_id
    }));
    const { error } = await supabase.from("spc_predictions").insert(rows);
    if (error) throw error;
}
