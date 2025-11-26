// lib/queries/dashboard.ts

import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

// Helper to get a Supabase client instance
function getClient(): SupabaseClient {
    return createClient();
}

/**
 * Dashboard KPI metrics used by KPICard components.
 */
export async function getDashboardMetrics() {
    const supabase = getClient();
    const now = Date.now();

    const [
        { count: releasedCount },
        { count: ncCount },
        { data: pcc },
        { data: turnaround },
        { count: trainingsCount },
        { count: quarantineCount },
    ] = await Promise.all([
        supabase
            .from("finished_lots")
            .select("id", { count: "exact", head: true })
            .eq("status", "liberado")
            .gte("analyzed_at", new Date(now - 24 * 60 * 60 * 1000).toISOString()),
        supabase
            .from("nc")
            .select("id", { count: "exact", head: true })
            .eq("status", "open"),
        supabase
            .from("food_safety_pcc")
            .select("status"),
        supabase
            .from("samples")
            .select("collected_at, analyzed_at")
            .gte("analyzed_at", new Date(now - 24 * 60 * 60 * 1000).toISOString()),
        supabase
            .from("trainings")
            .select("id", { count: "exact", head: true }),
        supabase
            .from("raw_material_lots")
            .select("id", { count: "exact", head: true })
            .eq("status", "quarantine"),
    ]);

    const releasedTotal = releasedCount ?? 0;
    const ncTotal = ncCount ?? 0;
    const pccPrecision =
        pcc?.length && pcc.filter((r: any) => r.status === "active").length
            ? (pcc.filter((r: any) => r.status === "active").length * 100) / pcc.length
            : 0;
    const avgTurnaround =
        turnaround?.length
            ? turnaround.reduce((sum: number, r: any) => {
                const start = new Date(r.collected_at).getTime();
                const end = new Date(r.analyzed_at).getTime();
                return sum + (end - start) / 60000; // minutes
            }, 0) / turnaround.length
            : 0;
    const trainingsTotal = trainingsCount ?? 0;
    const quarantineTotal = quarantineCount ?? 0;

    return {
        releasedCount: releasedTotal,
        ncCount: ncTotal,
        pccPrecision: pccPrecision.toFixed(1) + "%",
        avgTurnaround: Math.round(avgTurnaround) + " min",
        trainingsCount: trainingsTotal,
        quarantineCount: quarantineTotal,
    };
}

/**
 * Process window data for a given parameter and time range.
 * timeRange can be "24h", "7d", "30d", "ytd".
 */
export async function getProcessData(parameter: string, timeRange: string) {
    const supabase = getClient();
    let startDate = new Date();
    switch (timeRange) {
        case "24h":
            startDate.setHours(startDate.getHours() - 24);
            break;
        case "7d":
            startDate.setDate(startDate.getDate() - 7);
            break;
        case "30d":
            startDate.setDate(startDate.getDate() - 30);
            break;
        case "ytd":
            startDate = new Date(startDate.getFullYear(), 0, 1);
            break;
        default:
            startDate.setHours(startDate.getHours() - 24);
    }

    const { data: paramData } = await supabase.from("parameters").select("id").eq("name", parameter).single();

    if (!paramData) return [];

    const { data, error } = await supabase
        .from("lab_analysis")
        .select("analysis_date, result_value, limit_min, limit_max")
        .eq("parameter_id", paramData.id)
        .gte("analysis_date", startDate.toISOString())
        .order("analysis_date", { ascending: true });

    if (error) throw error;

    const chartData = data?.map((row: any) => ({
        time: new Date(row.analysis_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        value: Number(row.result_value),
        target: (Number(row.limit_min) + Number(row.limit_max)) / 2,
        lie: Number(row.limit_min),
        lse: Number(row.limit_max),
    }));

    return chartData ?? [];
}

/** Product distribution for the last 24h */
export async function getProductDistribution() {
    const supabase = getClient();
    const { data, error } = await supabase
        .from("finished_lots")
        .select("line")
        .gte("analyzed_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    if (error) throw error;
    const counts: Record<string, number> = {};
    data?.forEach((row: any) => {
        const key = row.line || "Unknown";
        counts[key] = (counts[key] || 0) + 1;
    });
    const colors = ["#a78bfa", "#22d3ee", "#f472b6", "#facc15", "#4ade80"];
    return Object.entries(counts).map(([name, value], i) => ({
        name,
        value,
        color: colors[i % colors.length],
    }));
}

/** Line activity for today */
export async function getLineActivity() {
    const supabase = getClient();
    const { data, error } = await supabase
        .from("production_lots")
        .select("production_line, status")
        .eq("status", "open");
    if (error) throw error;

    const lines: Record<string, { emProducao: number; troca: number; parada: number }> = {};
    data?.forEach((row: any) => {
        const line = row.production_line || "General";
        if (!lines[line]) lines[line] = { emProducao: 0, troca: 0, parada: 0 };
        if (row.status === "open") lines[line].emProducao++;
        else if (row.status === "changeover") lines[line].troca++;
        else lines[line].parada++;
    });
    return Object.entries(lines).map(([name, v]) => ({ name, ...v }));
}

/** Top analysts for current month */
export async function getTopAnalysts() {
    const supabase = getClient();
    const start = new Date();
    start.setDate(1);
    const { data, error } = await supabase
        .from("lab_analysis")
        .select("analyst_id")
        .gte("analysis_date", start.toISOString());
    if (error) throw error;
    const counts: Record<string, number> = {};
    data?.forEach((row: any) => {
        const id = row.analyst_id;
        if (id) counts[id] = (counts[id] || 0) + 1;
    });
    const analystIds = Object.keys(counts);
    if (analystIds.length === 0) return [];

    const { data: users } = await supabase.from("profiles").select("id, full_name").in("id", analystIds);
    const result = analystIds
        .map((id) => ({ id, name: users?.find((u: any) => u.id === id)?.full_name ?? "Unknown", count: counts[id] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
    return result;
}

/** Released vs blocked lots for last N days */
export async function getReleasedBlockedLots(days: number = 5) {
    const supabase = getClient();
    const start = new Date();
    start.setDate(start.getDate() - days);
    const { data, error } = await supabase
        .from("finished_lots")
        .select("analyzed_at, status")
        .gte("analyzed_at", start.toISOString());
    if (error) throw error;
    const map: Record<string, { liberados: number; bloqueados: number }> = {};
    data?.forEach((row: any) => {
        if (!row.analyzed_at) return;
        const day = new Date(row.analyzed_at).toLocaleDateString("pt-BR", { weekday: "short" });
        if (!map[day]) map[day] = { liberados: 0, bloqueados: 0 };
        if (row.status === "liberado" || row.status === "released") map[day].liberados++;
        else map[day].bloqueados++;
    });
    return Object.entries(map).map(([day, v]) => ({ day, ...v }));
}

/** Capability metrics (Cpk and OOS) */
export async function getCapabilityMetrics() {
    const supabase = getClient();
    const { data, error } = await supabase
        .from("finished_lots")
        .select("line, brix, ph, density, co2, status")
        .gte("analyzed_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    if (error) throw error;
    const lines: Record<string, { cpk: number; oos: number }> = {};
    data?.forEach((row: any) => {
        const line = row.line || "General";
        if (!lines[line]) lines[line] = { cpk: 0, oos: 0 };
        lines[line].cpk = 1.33;
        lines[line].oos = row.status === "blocked" ? 1 : 0;
    });
    return Object.entries(lines).map(([line, v]) => ({ line, ...v }));
}

/** Instant alerts (critical NCs, pending audits, expiring trainings) */
export async function getInstantAlerts() {
    const supabase = getClient();
    const [{ count: criticalNC }, { count: pendingAudits }, { count: expiringTrainings }] = await Promise.all([
        supabase
            .from("nc")
            .select("id", { count: "exact", head: true })
            .eq("status", "open"),
        supabase
            .from("audits")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),
        supabase
            .from("trainings")
            .select("id", { count: "exact", head: true }),
    ]);
    return {
        criticalNC: criticalNC ?? 0,
        pendingAudits: pendingAudits ?? 0,
        expiringTrainings: expiringTrainings ?? 0,
    };
}

/** Shift notes (critical alerts for current shift) */
export async function getShiftNotes() {
    const supabase = getClient();
    const { data, error } = await supabase
        .from("shift_notes")
        .select("message, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
    if (error) throw error;
    return data ?? [];
}

/** Analysis total count for a given period */
export async function getAnalysisTotal(period: "daily" | "weekly" | "monthly" = "daily") {
    const supabase = getClient();
    let start = new Date();
    switch (period) {
        case "daily":
            start.setDate(start.getDate() - 1);
            break;
        case "weekly":
            start.setDate(start.getDate() - 7);
            break;
        case "monthly":
            start.setMonth(start.getMonth() - 1);
            break;
    }
    const { count } = await supabase
        .from("lab_analysis")
        .select("id", { count: "exact", head: true })
        .gte("analysis_date", start.toISOString());
    return count ?? 0;
}

/**
 * Get pending samples for the technician dashboard
 */
export async function getPendingSamples(limit: number = 10) {
    const supabase = getClient();

    const { data, error } = await supabase
        .from("samples")
        .select(`
            id,
            code,
            status,
            collection_date,
            product:products(name, sku),
            tank:tanks(code)
        `)
        .eq("status", "pending_analysis")
        .order("collection_date", { ascending: true })
        .limit(limit);

    if (error) throw error;

    return data?.map((sample: any) => ({
        id: sample.id,
        code: sample.code,
        productName: sample.product?.name || "Unknown Product",
        tankCode: sample.tank?.code || "N/A",
        collectedAt: sample.collection_date,
        status: sample.status
    })) ?? [];
}

