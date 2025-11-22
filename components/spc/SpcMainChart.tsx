"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SPCAnalysisResult, SpcPrediction } from "@/types/spc";
import {
    CartesianGrid,
    ComposedChart,
    Line,
    ReferenceArea,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

type Props = {
    title: string;
    subtitle?: string;
    analysis: SPCAnalysisResult;
    predictions?: SpcPrediction[];
    height?: number;
};

export function SpcMainChart({ title, subtitle, analysis, predictions = [], height = 440 }: Props) {
    const { data, limits, violations } = analysis;
    const violationMap = new Map<number, string>();
    violations.forEach((v) => violationMap.set(v.index, v.ruleName));

    const chartData = data.map((point, index) => ({
        ...point,
        index,
        isViolation: violationMap.has(index),
        rule: violationMap.get(index)
    }));

    const riskBand = predictions.find((p) => p.horizon_minutes === 60)?.risk_score ?? 0;
    const x1Risk = chartData.length > 3 ? chartData[chartData.length - 3].label : chartData[0]?.label;
    const x2Risk = chartData[chartData.length - 1]?.label;

    return (
        <Card className="bg-slate-900/80 border-slate-800">
            <CardHeader>
                <CardTitle className="text-slate-100">{title}</CardTitle>
                {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
            </CardHeader>
            <CardContent>
                <div style={{ height }}>
                    <ResponsiveContainer>
                        <ComposedChart
                            data={chartData}
                            margin={{ top: 30, right: 30, left: 10, bottom: 10 }}
                        >
                            {/* Zones */}
                            <ReferenceArea y1={limits.cl + limits.sigma} y2={limits.cl + 2 * limits.sigma} fill="#0ea5e9" fillOpacity={0.05} />
                            <ReferenceArea y1={limits.cl - limits.sigma} y2={limits.cl - 2 * limits.sigma} fill="#0ea5e9" fillOpacity={0.05} />
                            <ReferenceArea y1={limits.cl + 2 * limits.sigma} y2={limits.cl + 3 * limits.sigma} fill="#f97316" fillOpacity={0.05} />
                            <ReferenceArea y1={limits.cl - 2 * limits.sigma} y2={limits.cl - 3 * limits.sigma} fill="#f97316" fillOpacity={0.05} />

                            {/* Forecast risk band */}
                            {riskBand > 0.6 && x1Risk && x2Risk && (
                                <ReferenceArea
                                    x1={x1Risk}
                                    x2={x2Risk}
                                    fill="#ef4444"
                                    fillOpacity={0.06 + riskBand * 0.2}
                                    label={{ value: `Predicted risk ${Math.round(riskBand * 100)}%`, position: "top" }}
                                />
                            )}

                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="label" tick={{ fill: "#94a3b8" }} />
                            <YAxis tick={{ fill: "#94a3b8" }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }}
                                labelStyle={{ color: "#e2e8f0" }}
                            />

                            <ReferenceLine y={limits.cl} stroke="#22c55e" label="CL" />
                            <ReferenceLine y={limits.ucl} stroke="#ef4444" strokeDasharray="5 5" label="UCL" />
                            <ReferenceLine y={limits.lcl} stroke="#ef4444" strokeDasharray="5 5" label="LCL" />
                            {limits.usl !== undefined && (
                                <ReferenceLine y={limits.usl} stroke="#f59e0b" strokeDasharray="4 4" label="USL" />
                            )}
                            {limits.lsl !== undefined && (
                                <ReferenceLine y={limits.lsl} stroke="#f59e0b" strokeDasharray="4 4" label="LSL" />
                            )}

                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#38bdf8"
                                strokeWidth={2}
                                dot={{
                                    r: 5,
                                    fill: "#38bdf8",
                                    stroke: "#0f172a",
                                    strokeWidth: 1
                                }}
                                activeDot={(props: any) => {
                                    const { cx, cy, payload } = props;
                                    const color = payload.isViolation ? "#ef4444" : "#38bdf8";
                                    return <circle cx={cx} cy={cy} r={6} fill={color} stroke="#0f172a" strokeWidth={2} />;
                                }}
                                isAnimationActive={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
