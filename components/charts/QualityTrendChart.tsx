"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

const data = [
    {
        time: "08:00",
        score: 98,
        target: 95,
    },
    {
        time: "09:00",
        score: 97,
        target: 95,
    },
    {
        time: "10:00",
        score: 99,
        target: 95,
    },
    {
        time: "11:00",
        score: 96,
        target: 95,
    },
    {
        time: "12:00",
        score: 98,
        target: 95,
    },
    {
        time: "13:00",
        score: 99,
        target: 95,
    },
    {
        time: "14:00",
        score: 97,
        target: 95,
    },
]

export function QualityTrendChart() {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                    dataKey="time"
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
                    domain={[90, 100]}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f8fafc" }}
                    itemStyle={{ color: "#f8fafc" }}
                />
                <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: "#10b981" }}
                />
                <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#64748b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
