import { calculateStabilityIndex } from "@/lib/spc/engine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import { SPCAnalysisResult, SpcPrediction } from "@/types/spc";
import { Activity, AlertTriangle, Gauge, Sigma } from "lucide-react";

type Props = {
    analysis: SPCAnalysisResult;
    predictions: SpcPrediction[];
};

export function SpcKpiPanel({ analysis, predictions }: Props) {
    const { capability, data } = analysis;
    const stability = calculateStabilityIndex(data);
    const highRisk = predictions.find((p) => p.risk_score >= 0.65);

    return (
        <Card className="bg-slate-900/80 border-slate-800">
            <CardHeader>
                <CardTitle className="text-slate-100">Process KPIs</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Cp"
                    value={capability?.cp?.toFixed(2) ?? "—"}
                    description="Within capability"
                    icon={Gauge}
                />
                <StatCard
                    title="Cpk"
                    value={capability?.cpk?.toFixed(2) ?? "—"}
                    description="Centered capability"
                    icon={Sigma}
                />
                <StatCard
                    title="Stability"
                    value={(stability * 100).toFixed(0) + "%"}
                    description="Zone of control"
                    icon={Activity}
                />
                <StatCard
                    title="Predictive risk"
                    value={highRisk ? `${Math.round(highRisk.risk_score * 100)}%` : "Low"}
                    description={highRisk ? `${highRisk.horizon_minutes} min horizon` : "No projected risk"}
                    icon={AlertTriangle}
                    trend={highRisk ? "up" : "neutral"}
                />
            </CardContent>
        </Card>
    );
}
