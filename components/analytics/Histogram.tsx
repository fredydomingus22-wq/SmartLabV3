"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";

interface HistogramProps {
    data: Array<{
        bin: string;
        frequency: number;
    }>;
    lsl?: number;
    usl?: number;
    mean?: number;
}

export function Histogram({ data, lsl, usl, mean }: HistogramProps) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                    dataKey="bin"
                    stroke="#94a3b8"
                    label={{ value: "Value Range", position: "insideBottom", offset: -5, fill: "#94a3b8" }}
                />
                <YAxis
                    stroke="#94a3b8"
                    label={{ value: "Frequency", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                    labelStyle={{ color: "#cbd5e1" }}
                />

                {/* Specification Limits */}
                {lsl !== undefined && (
                    <ReferenceLine x={lsl.toString()} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "LSL", fill: "#ef4444" }} />
                )}
                {usl !== undefined && (
                    <ReferenceLine x={usl.toString()} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "USL", fill: "#ef4444" }} />
                )}
                {mean !== undefined && (
                    <ReferenceLine x={mean.toString()} stroke="#10b981" label={{ value: "Mean", fill: "#10b981" }} />
                )}

                {/* Frequency Bars */}
                <Bar
                    dataKey="frequency"
                    fill="#3b82f6"
                    name="Frequency"
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
