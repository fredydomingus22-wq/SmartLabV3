"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
    { name: "Normal Stock", value: 85, color: "#22c55e" },
    { name: "Low Stock", value: 10, color: "#eab308" },
    { name: "Critical/Out", value: 5, color: "#ef4444" },
];

export function StockHealthChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
                    itemStyle={{ color: "#f8fafc" }}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}
