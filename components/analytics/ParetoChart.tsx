"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Line,
    ComposedChart,
} from "recharts";

interface ParetoChartProps {
    data: Array<{
        category: string;
        count: number;
        cumulative: number;
    }>;
}

export function ParetoChart({ data }: ParetoChartProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                    dataKey="category"
                    stroke="#94a3b8"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                />
                <YAxis
                    yAxisId="left"
                    stroke="#94a3b8"
                    label={{ value: "Frequency", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
                />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#f59e0b"
                    label={{ value: "Cumulative %", angle: 90, position: "insideRight", fill: "#f59e0b" }}
                    domain={[0, 100]}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                    labelStyle={{ color: "#cbd5e1" }}
                />
                <Legend />

                {/* Bars for defect count */}
                <Bar
                    yAxisId="left"
                    dataKey="count"
                    fill="#3b82f6"
                    name="Defect Count"
                />

                {/* Line for cumulative percentage */}
                <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: "#f59e0b", r: 4 }}
                    name="Cumulative %"
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}
