"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const data = [
    { name: "Sulfuric Acid", usage: 150 },
    { name: "Methanol", usage: 120 },
    { name: "Sodium Hydroxide", usage: 95 },
    { name: "Acetonitrile", usage: 80 },
    { name: "Ethanol", usage: 65 },
];

export function TopReagentsChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                />
                <Tooltip
                    cursor={{ fill: "#334155", opacity: 0.2 }}
                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
                    itemStyle={{ color: "#f8fafc" }}
                />
                <Bar dataKey="usage" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
        </ResponsiveContainer>
    );
}
