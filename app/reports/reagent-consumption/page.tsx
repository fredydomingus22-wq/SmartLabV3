"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Download, FileText, TrendingDown, AlertTriangle } from "lucide-react";
import { getAllRecentMovements } from "@/lib/queries/reagent-movements";
import { getReagents, getLowStockReagents } from "@/lib/queries/reagents";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ReagentConsumptionReport() {
    const [period, setPeriod] = useState("2024-11");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        loadReportData();
    }, [period]);

    async function loadReportData() {
        setLoading(true);
        try {
            const [movements, reagents, lowStock] = await Promise.all([
                getAllRecentMovements(100),
                getReagents(),
                getLowStockReagents(),
            ]);

            const processedData = processReagentData(movements, reagents, lowStock);
            setData(processedData);
        } catch (error) {
            console.error("Error loading report:", error);
            setData(generateDemoData());
        } finally {
            setLoading(false);
        }
    }

    function processReagentData(movements: any[], reagents: any[], lowStock: any[]) {
        const withdrawals = movements.filter((m) => m.movement_type === "withdrawal");
        const entries = movements.filter((m) => m.movement_type === "entry");

        const totalWithdrawn = withdrawals.reduce((sum, m) => sum + m.quantity, 0);
        const totalReceived = entries.reduce((sum, m) => sum + m.quantity, 0);

        // Group withdrawals by reagent
        const byReagent = withdrawals.reduce((acc, w) => {
            const reagentName = (w as any).reagent?.name || "Unknown";
            if (!acc[reagentName]) {
                acc[reagentName] = 0;
            }
            acc[reagentName] += w.quantity;
            return acc;
        }, {} as Record<string, number>);

        const topConsumers = Object.entries(byReagent)
            .map(([name, quantity]) => ({ reagent: name, quantity }))
            .sort((a: { quantity: number }, b: { quantity: number }) => b.quantity - a.quantity)
            .slice(0, 5);

        return {
            summary: {
                totalReagents: reagents.length,
                totalWithdrawn: totalWithdrawn.toFixed(2),
                totalReceived: totalReceived.toFixed(2),
                lowStockCount: lowStock.length,
                withdrawalCount: withdrawals.length,
                avgConsumption: (totalWithdrawn / reagents.length).toFixed(2),
            },
            topConsumers,
            movementsByType: [
                { type: "Withdrawals", count: withdrawals.length },
                { type: "Entries", count: entries.length },
                { type: "Returns", count: movements.filter((m) => m.movement_type === "return").length },
            ],
            lowStockReagents: lowStock.map((r) => ({
                name: r.name,
                current: r.stock_current,
                min: r.stock_min,
            })),
        };
    }

    function generateDemoData() {
        return {
            summary: {
                totalReagents: 45,
                totalWithdrawn: "284.5",
                totalReceived: "320.0",
                lowStockCount: 5,
                withdrawalCount: 128,
                avgConsumption: "6.3",
            },
            topConsumers: [
                { reagent: "Phenolphthalein", quantity: 45.5 },
                { reagent: "Sodium Hydroxide", quantity: 38.2 },
                { reagent: "Sulfuric Acid", quantity: 32.8 },
                { reagent: "Methyl Orange", quantity: 28.4 },
                { reagent: "Potassium Permanganate", quantity: 24.1 },
            ],
            movementsByType: [
                { type: "Withdrawals", count: 128 },
                { type: "Entries", count: 45 },
                { type: "Returns", count: 12 },
            ],
            lowStockReagents: [
                { name: "Phenolphthalein", current: 50, min: 100 },
                { name: "Methyl Orange", current: 75, min: 100 },
                { name: "Bromothymol Blue", current: 30, min: 50 },
            ],
        };
    }

    if (loading || !data) {
        return (
            <AppShell>
                <div className="p-6">
                    <div className="text-center py-20">Loading report...</div>
                </div>
            </AppShell>
        );
    }

    const { summary, topConsumers, movementsByType, lowStockReagents } = data;

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <SectionHeader
                        title="Reagent Consumption Report"
                        description="Monthly reagent usage analysis and stock status"
                    />
                    <div className="flex gap-2">
                        <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2024-11">November 2024</SelectItem>
                                <SelectItem value="2024-10">October 2024</SelectItem>
                                <SelectItem value="2024-09">September 2024</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Excel
                        </Button>
                    </div>
                </div>

                {/* Summary KPIs */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Reagents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{summary.totalReagents}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-blue-900/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-500">
                                Total Withdrawn
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-400">
                                {summary.totalWithdrawn}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {summary.withdrawalCount} transactions
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-green-900/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-500">
                                Total Received
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-400">
                                {summary.totalReceived}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                                Net: +{(parseFloat(summary.totalReceived) - parseFloat(summary.totalWithdrawn)).toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-red-900/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-500">
                                Low Stock Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-400">
                                {summary.lowStockCount}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                                <AlertTriangle className="w-3 h-3" />
                                Requires attention
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Top Consumers */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Top 5 Most Consumed Reagents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topConsumers} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis type="number" stroke="#94a3b8" />
                                    <YAxis dataKey="reagent" type="category" stroke="#94a3b8" width={150} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "1px solid #334155",
                                        }}
                                    />
                                    <Bar dataKey="quantity" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Movement Types */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Stock Movements by Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={movementsByType}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) => `${entry.type}: ${entry.count}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {movementsByType.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Low Stock Table */}
                {lowStockReagents.length > 0 && (
                    <Card className="bg-slate-900 border-red-900/50">
                        <CardHeader>
                            <CardTitle className="text-red-500 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Low Stock Reagents - Action Required
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {lowStockReagents.map((reagent, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 rounded-lg bg-red-950/30 border border-red-900/50"
                                    >
                                        <div className="font-medium">{reagent.name}</div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Current: </span>
                                                <span className="font-bold text-red-400">{reagent.current}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Min: </span>
                                                <span className="font-bold">{reagent.min}</span>
                                            </div>
                                            <div className="text-red-400">
                                                -{((1 - reagent.current / reagent.min) * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Report Footer */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="text-center text-sm text-muted-foreground">
                            <p>Report generated on {new Date().toLocaleDateString()}</p>
                            <p className="mt-1">SmartLab Enterprise Inventory Management</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
