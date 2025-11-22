"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
} from "recharts";
import { useProductDistribution } from "@/lib/hooks/useDashboardData";
import { ChartSkeleton } from "@/components/ui/skeleton";

export function ProductDistribution() {
    const { data: chartData, isLoading, error } = useProductDistribution();

    if (error) {
        return (
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-white">
                        Distribuição de Produtos
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Últimas 24h</p>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-sm text-red-500">
                        Falha ao carregar dados.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white">
                    Distribuição de Produtos
                </CardTitle>
                <p className="text-sm text-muted-foreground">Últimas 24h</p>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <ChartSkeleton height="h-[280px]" />
                ) : (
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData ?? []}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {(chartData ?? []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}
                                    itemStyle={{ color: "#e2e8f0" }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
                <p className="text-center text-sm text-muted-foreground mt-2">
                    Total {chartData?.reduce((sum, d) => sum + d.value, 0) ?? 0} lotes monitorados
                </p>
            </CardContent>
        </Card>
    );
}
