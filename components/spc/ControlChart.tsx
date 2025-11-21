"use client"

import { useMemo } from "react";
import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    Dot
} from "recharts";
import { SPCAnalysisResult, SPCDataPoint } from "@/types/spc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ControlChartProps {
    title: string;
    data: SPCAnalysisResult;
    height?: number;
}

export function ControlChart({ title, data, height = 400 }: ControlChartProps) {
    const { limits, violations, data: points } = data;

    // Prepare data for chart
    const chartData = points.map((p, index) => {
        const violation = violations.find(v => v.index === index);
        return {
            ...p,
            index,
            violation: violation ? violation.ruleName : null,
            isViolation: !!violation
        };
    });

    const CustomDot = (props: any) => {
        const { cx, cy, payload } = props;
        if (payload.isViolation) {
            return (
                <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="white" strokeWidth={2} />
            );
        }
        return <circle cx={cx} cy={cy} r={4} fill="#2563eb" />;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ height: height, width: "100%" }}>
                    <ResponsiveContainer>
                        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="label" />
                            <YAxis domain={['auto', 'auto']} />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-background border rounded p-2 shadow-md text-sm">
                                                <p className="font-bold">{data.label}</p>
                                                <p>Value: {data.value.toFixed(3)}</p>
                                                {data.isViolation && (
                                                    <p className="text-destructive font-semibold mt-1">
                                                        ⚠️ {data.violation}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />

                            {/* Control Limits */}
                            <ReferenceLine y={limits.ucl} stroke="#ef4444" strokeDasharray="5 5" label="UCL" />
                            <ReferenceLine y={limits.cl} stroke="#10b981" label="CL" />
                            <ReferenceLine y={limits.lcl} stroke="#ef4444" strokeDasharray="5 5" label="LCL" />

                            {/* Spec Limits (if available) */}
                            {limits.usl !== undefined && (
                                <ReferenceLine y={limits.usl} stroke="#f59e0b" strokeDasharray="3 3" label="USL" />
                            )}
                            {limits.lsl !== undefined && (
                                <ReferenceLine y={limits.lsl} stroke="#f59e0b" strokeDasharray="3 3" label="LSL" />
                            )}

                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={<CustomDot />}
                                activeDot={{ r: 8 }}
                                isAnimationActive={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
