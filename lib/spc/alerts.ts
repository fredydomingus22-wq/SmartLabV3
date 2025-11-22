import { SPCAnalysisResult, SpcAlert, SpcPrediction } from "@/types/spc";

function mapSeverity(ruleSeverity?: SpcAlert["severity"]) {
    return ruleSeverity ?? "warning";
}

export function deriveSpcAlerts(
    analysis: SPCAnalysisResult,
    predictions: SpcPrediction[] = [],
    parameterId?: string
): SpcAlert[] {
    const now = new Date().toISOString();
    const violationAlerts: SpcAlert[] = analysis.violations.map((v) => ({
        id: `local-${v.ruleId}-${v.index}-${v.point.id}`,
        parameter_id: parameterId,
        severity: mapSeverity(v.severity),
        type: "rule_violation",
        message: `[${v.ruleName}] ${v.description}`,
        status: "open",
        triggered_at: now
    }));

    const predictionAlerts: SpcAlert[] = predictions
        .filter((p) => p.risk_score >= 0.65)
        .map((p) => ({
            id: `local-pred-${p.horizon_minutes}-${parameterId ?? "param"}`,
            parameter_id: parameterId,
            severity: p.risk_score >= 0.85 ? "critical" : "warning",
            type: "prediction_risk",
            message: `Risk ${Math.round(p.risk_score * 100)}% in ${p.horizon_minutes} min (${p.trend})`,
            status: "open",
            triggered_at: p.generated_at
        }));

    return [...violationAlerts, ...predictionAlerts];
}
