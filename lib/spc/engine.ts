import { calculateCapability, calculateIMRLimits, calculateMean, calculateStdDev, calculateXbarRLimits } from "@/lib/spc/math";
import { checkNelsonRules } from "@/lib/spc/rules";
import {
    ChartType,
    ControlLimits,
    SPCAnalysisResult,
    SPCDataPoint,
    SpcChartConfig,
    SpcRuleBreak
} from "@/types/spc";

type ControlConfig = {
    chartType: ChartType;
    subgroupSize?: number;
    lsl?: number;
    usl?: number;
    target?: number;
};

function buildControlLimits(points: SPCDataPoint[], config: ControlConfig): ControlLimits {
    const baseUscl = config.usl;
    const baseLsl = config.lsl;

    switch (config.chartType) {
        case "Xbar-R":
            return calculateXbarRLimits(points, config.subgroupSize ?? 4, baseUscl, baseLsl);
        case "I-MR":
        default:
            return calculateIMRLimits(points, baseUscl, baseLsl);
    }
}

export function analyzeSeries(points: SPCDataPoint[], config: SpcChartConfig): SPCAnalysisResult {
    const chartType = config.chart_type ?? "I-MR";
    const sorted = [...points].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const limits = buildControlLimits(sorted, {
        chartType,
        subgroupSize: config.baseline_window ?? 4,
        lsl: config.lsl,
        usl: config.usl,
        target: config.target
    });

    const violations = checkNelsonRules(sorted, limits);
    const capability = calculateCapability(sorted, limits);

    return {
        data: sorted,
        limits,
        violations,
        capability
    };
}

export function summarizeRuleBreaks(violations: SPCAnalysisResult["violations"]): SpcRuleBreak[] {
    return violations.map((v) => ({
        rule_name: v.ruleName,
        description: v.description,
        point: v.point,
        severity: v.severity ?? "warning"
    }));
}

export function calculateStabilityIndex(points: SPCDataPoint[]): number {
    if (points.length < 2) return 0;
    const values = points.map((p) => p.value);
    const mean = calculateMean(values);
    const std = calculateStdDev(values);
    if (std === 0) return 1;

    const deviations = values.map((v) => Math.abs(v - mean));
    const meanDeviation = calculateMean(deviations);
    const normalized = 1 - Math.min(meanDeviation / (3 * std), 1);
    return Number(normalized.toFixed(3));
}
