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
    const [{ data: released }, { data: nc }, { data: pcc }, { data: turnaround }, { data: trainings }, { data: quarantine }] = await Promise.all([
        // Lotes liberados (last 24h)
        supabase
            .from("finished_product_lots")
            .select("id", { count: "exact", head: true })
            .eq("status", "liberado")
            .gte("analyzed_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        // NCs críticas abertas
        supabase
            .from("non_conformities")
            .select("id", { count: "exact", head: true })
            .eq("severity", "critical")
            .is("closed_at", null),
        // Precisão PCC (last 72h)
        supabase
            .from("pcc_records")
            .select("status")
            .gte("created_at", new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()),
        // Lab turnaround average (minutes, last 24h)
        supabase
            .from("samples")
            .select("collected_at", "analyzed_at")
            .gte("analyzed_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        // Active trainings
        supabase
            .from("trainings")
            .select("id", { count: "exact", head: true })
            .eq("status", "active"),
        // Materials in quarantine
        supabase
            .from("raw_material_lots")
            .select("id", { count: "exact", head: true })
            .eq("status", "quarantine"),
    ]);

    // Compute derived values
    const releasedCount = released?.length ?? 0;
    const ncCount = nc?.length ?? 0;
    const pccPrecision =
        pcc?.length && pcc?.filter((r: any) => r.status === "approved").length
            ? (pcc?.filter((r: any) => r.status === "approved").length * 100) / pcc?.length
            : 0;
    const avgTurnaround =
        turnaround?.length
            ? turnaround.reduce((sum: number, r: any) => {
                const start = new Date(r.collected_at).getTime();
                const end = new Date(r.analyzed_at).getTime();
                return sum + (end - start) / 60000; // minutes
            }, 0) / turnaround.length
            : 0;
    const trainingsCount = trainings?.length ?? 0;
    const quarantineCount = quarantine?.length ?? 0;

    return {
        releasedCount,
        ncCount,
        pccPrecision: pccPrecision.toFixed(1) + "%",
        avgTurnaround: Math.round(avgTurnaround) + " min",
        trainingsCount,
        quarantineCount,
    };
}

/**
 * Process window data for a given parameter and time range.
 * timeRange can be "24h", "7d", "30d", "ytd".
 */
export async function getProcessData(parameter: string, timeRange: string) {
    const supabase = getClient();
    // Determine start date based on timeRange
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

    const { data, error } = await supabase
        .from("lab_analyses")
        .select("analysis_date, result_value, spec_target, spec_min, spec_max")
        .eq("parameter_name", parameter)
        .gte("analysis_date", startDate.toISOString())
        .order("analysis_date", { ascending: true });

    if (error) throw error;

    // Transform to chart format
    const chartData = data?.map((row: any) => ({
        time: new Date(row.analysis_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        value: Number(row.result_value),
        target: Number(row.spec_target),
        lie: Number(row.spec_min),
        lse: Number(row.spec_max),
    }));

    return chartData ?? [];
}

/** Product distribution for the last 24h */
export async function getProductDistribution() {
    const supabase = getClient();
    const { data, error } = await supabase
        .from("finished_product_lots")
        .select("sku, id", { count: "exact", head: false })
        .gte("analyzed_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .group("sku")
        .select("sku", { count: "exact", head: false });
    if (error) throw error;
    // Count per SKU
    const counts: Record<string, number> = {};
    data?.forEach((row: any) => {
        counts[row.sku] = (counts[row.sku] || 0) + 1;
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
        .eq("date", new Date().toISOString().split("T")[0]);
    if (error) throw error;
    const lines: Record<string, { emProducao: number; troca: number; parada: number }> = {};
    data?.forEach((row: any) => {
        const line = row.production_line;
        if (!lines[line]) lines[line] = { emProducao: 0, troca: 0, parada: 0 };
        switch (row.status) {
            case "em_producao":
                lines[line].emProducao++;
                break;
            case "troca":
                lines[line].troca++;
                break;
            case "parada":
                lines[line].parada++;
                break;
        }
    });
    return Object.entries(lines).map(([name, v]) => ({ name, ...v }));
}

/** Top analysts for current month */
export async function getTopAnalysts() {
    const supabase = getClient();
    const start = new Date();
    start.setDate(1);
    const { data, error } = await supabase
        .from("lab_analyses")
        .select("analyst_id, id")
        .gte("analysis_date", start.toISOString());
    if (error) throw error;
    const counts: Record<string, number> = {};
    data?.forEach((row: any) => {
        const id = row.analyst_id;
        counts[id] = (counts[id] || 0) + 1;
    });
    // fetch user names
    const analystIds = Object.keys(counts);
    const { data: users } = await supabase.from("users").select("id, name").in("id", analystIds);
    const result = analystIds
        .map((id) => ({ id, name: users?.find((u: any) => u.id === id)?.name ?? "", count: counts[id] }))
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
        .from("finished_product_lots")
        .select("analyzed_at, status")
        .gte("analyzed_at", start.toISOString());
    if (error) throw error;
    const map: Record<string, { liberados: number; bloqueados: number }> = {};
    data?.forEach((row: any) => {
        const day = new Date(row.analyzed_at).toLocaleDateString("pt-BR", { weekday: "short" });
        if (!map[day]) map[day] = { liberados: 0, bloqueados: 0 };
        if (row.status === "liberado") map[day].liberados++;
        else map[day].bloqueados++;
    });
    return Object.entries(map).map(([day, v]) => ({ day, ...v }));
}

/** Capability metrics (Cpk and OOS) */
export async function getCapabilityMetrics() {
    const supabase = getClient();
    const { data, error } = await supabase
        .from("finished_product_lots")
        .select("line, brix, ph, density, co2, status")
        .gte("analyzed_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    if (error) throw error;
    // Simple placeholder calculation – real Cpk would need spec limits
    const lines: Record<string, { cpk: number; oos: number }> = {};
    data?.forEach((row: any) => {
        const line = row.line;
        if (!lines[line]) lines[line] = { cpk: 0, oos: 0 };
        // fake Cpk based on variance (placeholder)
        lines[line].cpk = Math.random() * 2 + 1; // 1‑3 range
        lines[line].oos = Math.random() * 5; // 0‑5%
    });
    return Object.entries(lines).map(([line, v]) => ({ line, ...v }));
}

/** Instant alerts (critical NCs, pending audits, expiring trainings) */
export async function getInstantAlerts() {
    const supabase = getClient();
    const [{ data: criticalNC }, { data: pendingAudits }, { data: expiringTrainings }] = await Promise.all([
        supabase
            .from("non_conformities")
            .select("id", { count: "exact", head: true })
            .eq("severity", "critical")
            .is("closed_at", null),
        supabase
            .from("audits")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),
        supabase
            .from("trainings")
            .select("id", { count: "exact", head: true })
            .lt("expires_at", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
            .eq("status", "active"),
    ]);
    return {
        criticalNC: criticalNC?.length ?? 0,
        pendingAudits: pendingAudits?.length ?? 0,
        expiringTrainings: expiringTrainings?.length ?? 0,
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
    const { data, error } = await supabase
        .from("lab_analyses")
        .select("id", { count: "exact", head: true })
        .gte("analysis_date", start.toISOString());
    if (error) throw error;
    return data?.length ?? 0;
}
