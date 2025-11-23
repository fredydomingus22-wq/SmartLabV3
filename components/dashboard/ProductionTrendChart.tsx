"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ProductionData {
    date: string;
    actual: number;
    target: number;
    day: string;
}

export function ProductionTrendChart() {
    const [data, setData] = useState<ProductionData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProductionData();
    }, []);

    async function loadProductionData() {
        try {
            const supabase = createClient();

            // Get last 7 days of production data
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 6);

            const { data: lots, error } = await supabase
                .from("production_lots")
                .select("created_at, quantity")
                .gte("created_at", startDate.toISOString())
                .lte("created_at", endDate.toISOString());

            if (error) throw error;

            // Aggregate by date
            const dateMap = new Map<string, number>();
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

            // Initialize all 7 days
            for (let i = 0; i < 7; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split("T")[0];
                dateMap.set(dateStr, 0);
            }

            // Sum quantities by date
            lots?.forEach((lot) => {
                const dateStr = lot.created_at.split("T")[0];
                const current = dateMap.get(dateStr) || 0;
                dateMap.set(dateStr, current + (lot.quantity || 0));
            });

            // Convert to chart format
            const chartData: ProductionData[] = Array.from(dateMap.entries()).map(([date, actual]) => {
                const dateObj = new Date(date);
                return {
                    date,
                    actual,
                    target: 50, // TODO: Get from parameters table
                    day: days[dateObj.getDay()],
                };
            });

            setData(chartData);
        } catch (error) {
            console.error("Error loading production data:", error);
            // Fallback to demo data
            setData(generateDemoData());
        } finally {
            setLoading(false);
        }
    }

    function generateDemoData(): ProductionData[] {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return days.map((day, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            day,
            actual: Math.floor(Math.random() * 30) + 35,
            target: 50,
        }));
    }

    const totalActual = data.reduce((sum, d) => sum + d.actual, 0);
    const totalTarget = data.reduce((sum, d) => sum + d.target, 0);
    const variance = totalActual - totalTarget;
    const variancePercent = totalTarget > 0 ? ((variance / totalTarget) * 100).toFixed(1) : "0.0";

    if (loading) {
        return (
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Production Trend (7 Days)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">Loading chart...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Production Trend (7 Days)
                    </CardTitle>
                    <div className="text-right">
                        <div className="text-2xl font-bold">{totalActual}</div>
                        <div className="text-xs text-muted-foreground">Total Lots</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-muted-foreground">Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">Target</span>
                    </div>
                    <div className="flex-1" />
                    <div className={`flex items-center gap-1 ${variance >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {variance >= 0 ? "+" : ""}
                        {variancePercent}%
                        {variance >= 0 ? <TrendingUp className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="day"
                            stroke="#94a3b8"
                            style={{ fontSize: "12px" }}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            style={{ fontSize: "12px" }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #334155",
                                borderRadius: "8px",
                            }}
                            labelStyle={{ color: "#e2e8f0" }}
                        />
                        <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: "#3b82f6", r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="target"
                            stroke="#10b981"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>

                <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                        <div className="text-muted-foreground">Avg/Day</div>
                        <div className="font-bold text-blue-400">
                            {(totalActual / data.length).toFixed(1)}
                        </div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">Target</div>
                        <div className="font-bold text-green-400">
                            {(totalTarget / data.length).toFixed(1)}
                        </div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">Variance</div>
                        <div className={`font-bold ${variance >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {variance >= 0 ? "+" : ""}
                            {variance}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
