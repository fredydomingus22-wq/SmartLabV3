"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { deriveSpcAlerts } from "@/lib/spc/alerts";
import { analyzeSeries } from "@/lib/spc/engine";
import { predictRisks } from "@/lib/spc/prediction";
import {
    acknowledgeSpcAlert,
    closeSpcAlert,
    fetchOpenSpcAlerts,
    fetchSpcChartConfig,
    fetchSpcMeasurements
} from "@/lib/queries/spc-war-room";
import { SPCAnalysisResult, SpcAlert, SpcChartConfig, SpcFilters, SpcPrediction } from "@/types/spc";

function windowToIso(window: SpcFilters["window"]): string | undefined {
    if (!window) return undefined;
    const now = new Date();
    const map: Record<NonNullable<SpcFilters["window"]>, number> = {
        "1h": 1,
        "8h": 8,
        "24h": 24,
        "7d": 24 * 7
    };
    const hours = map[window];
    now.setHours(now.getHours() - hours);
    return now.toISOString();
}

export function useSpcWarRoom(initialFilters: SpcFilters = {}) {
    const [filters, setFilters] = useState<SpcFilters>({ window: "8h", ...initialFilters });
    const [analysis, setAnalysis] = useState<SPCAnalysisResult | null>(null);
    const [chartConfig, setChartConfig] = useState<SpcChartConfig | null>(null);
    const [alerts, setAlerts] = useState<SpcAlert[]>([]);
    const [predictions, setPredictions] = useState<SpcPrediction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [measurements, configFromDb, openAlerts] = await Promise.all([
                fetchSpcMeasurements({
                    parameterId: filters.parameterId,
                    line: filters.line,
                    productId: filters.productId,
                    since: windowToIso(filters.window)
                }),
                fetchSpcChartConfig(filters.parameterId),
                fetchOpenSpcAlerts()
            ]);

            const config: SpcChartConfig = configFromDb ?? {
                id: "ad-hoc",
                name: "Ad-hoc chart",
                chart_type: "I-MR",
                lsl: undefined,
                usl: undefined,
                baseline_window: 4
            };

            if (config.chart_type === "I-MR" && measurements.length < 2 && measurements.length > 0) {
                // Duplicate last measurement to allow MR computation
                measurements.push({ ...measurements[measurements.length - 1], id: `${measurements.length}-dup` });
            }

            const analysisResult = analyzeSeries(measurements, config);
            const preds = predictRisks(analysisResult.data, analysisResult.limits);
            const derivedAlerts = deriveSpcAlerts(analysisResult, preds, config.parameter_id);

            setAnalysis(analysisResult);
            setChartConfig(config);
            setPredictions(preds);
            setAlerts([...derivedAlerts, ...openAlerts]);
        } catch (err: any) {
            setError(err.message ?? "Failed to load SPC data");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const acknowledge = useCallback(async (alertId: string) => {
        if (alertId.startsWith("local-")) {
            setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status: "acknowledged" } : a)));
            return;
        }
        await acknowledgeSpcAlert(alertId);
        setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status: "acknowledged" } : a)));
    }, []);

    const close = useCallback(async (alertId: string) => {
        if (alertId.startsWith("local-")) {
            setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status: "closed" } : a)));
            return;
        }
        await closeSpcAlert(alertId);
        setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, status: "closed" } : a)));
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const state = useMemo(
        () => ({
            filters,
            setFilters,
            analysis,
            chartConfig,
            alerts,
            predictions,
            loading,
            error,
            refresh,
            acknowledge,
            close
        }),
        [filters, analysis, chartConfig, alerts, predictions, loading, error, refresh, acknowledge, close]
    );

    return state;
}
