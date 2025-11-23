"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
    { date: "Nov 01", usage: 45 },
    { date: "Nov 05", usage: 52 },
    { date: "Nov 10", usage: 38 },
    { date: "Nov 15", usage: 65 },
    { date: "Nov 20", usage: 48 },
    { date: "Nov 25", usage: 55 },
];

export function ConsumptionChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}L`}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
                    itemStyle={{ color: "#f8fafc" }}
                />
                <Line
                    type="monotone"
                    dataKey="usage"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6" }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
