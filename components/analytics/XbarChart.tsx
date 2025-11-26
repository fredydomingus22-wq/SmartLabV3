"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";

interface XbarChartProps {
    data: Array<{
        subgroup: number;
        mean: number;
    }>;
    ucl: number;
    lcl: number;
    centerLine: number;
}

export function XbarChart({ data, ucl, lcl, centerLine }: XbarChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                    dataKey="subgroup"
                    stroke="#94a3b8"
                    label={{ value: "Subgroup", position: "insideBottom", offset: -5, fill: "#94a3b8" }}
                />
                <YAxis
                    stroke="#94a3b8"
                    label={{ value: "Sample Mean", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                    labelStyle={{ color: "#cbd5e1" }}
                />
                <Legend />

                {/* Control Limits */}
                <ReferenceLine y={ucl} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "UCL", fill: "#ef4444" }} />
                <ReferenceLine y={centerLine} stroke="#10b981" label={{ value: "X̄", fill: "#10b981" }} />
                <ReferenceLine y={lcl} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "LCL", fill: "#ef4444" }} />

                {/* Data Line */}
                <Line
                    type="monotone"
                    dataKey="mean"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="X̄"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
