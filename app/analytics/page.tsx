"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, PieChart } from "lucide-react";
import { XbarChart } from "@/components/analytics/XbarChart";
import { RChart } from "@/components/analytics/RChart";
import { ParetoChart } from "@/components/analytics/ParetoChart";
import { Histogram } from "@/components/analytics/Histogram";
import { interpretCpk } from "@/lib/spc/cpk-calculations";

// Sample data for demonstrations
const sampleXbarData = Array.from({ length: 20 }, (_, i) => ({
    subgroup: i + 1,
    mean: 100 + Math.random() * 4 - 2,
}));

const sampleRData = Array.from({ length: 20 }, (_, i) => ({
    subgroup: i + 1,
    range: 2 + Math.random() * 2,
}));

const sampleParetoData = [
    { category: "Defect A", count: 120, cumulative: 40 },
    { category: "Defect B", count: 90, cumulative: 70 },
    { category: "Defect C", count: 50, cumulative: 87 },
    { category: "Defect D", count: 25, cumulative: 95 },
    { category: "Others", count: 15, cumulative: 100 },
];

const sampleHistogramData = [
    { bin: "95-97", frequency: 5 },
    { bin: "97-99", frequency: 15 },
    { bin: "99-101", frequency: 45 },
    { bin: "101-103", frequency: 25 },
    { bin: "103-105", frequency: 10 },
];

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState("spc");

    // Sample process capability metrics
    const cpk = 1.67;
    const cp = 1.72;
    const ppk = 1.65;
    const pp = 1.70;

    return (
        <AppShell>
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Advanced Analytics
                    </h1>
                    <p className="text-slate-400">
                        Real-time process monitoring and statistical analysis
                    </p>
                </div>

                {/* Analytics Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
                        <TabsTrigger value="spc" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            SPC Charts
                        </TabsTrigger>
                        <TabsTrigger value="trends" className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Trend Analysis
                        </TabsTrigger>
                        <TabsTrigger value="pareto" className="flex items-center gap-2">
                            <PieChart className="h-4 w-4" />
                            Pareto & Histogram
                        </TabsTrigger>
                    </TabsList>

                    {/* SPC Charts Tab */}
                    <TabsContent value="spc" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white">X-bar Chart</CardTitle>
                                    <CardDescription>Subgroup means control chart</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <XbarChart
                                            data={sampleXbarData}
                                            ucl={102}
                                            lcl={98}
                                            centerLine={100}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white">R Chart</CardTitle>
                                    <CardDescription>Range control chart</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <RChart
                                            data={sampleRData}
                                            ucl={6.5}
                                            lcl={0}
                                            centerLine={3.2}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white">Process Capability</CardTitle>
                                <CardDescription>
                                    Cpk and Ppk analysis - {interpretCpk(cpk)} process capability
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-4">
                                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                                        <div className="text-3xl font-bold text-emerald-400">{cpk.toFixed(2)}</div>
                                        <div className="text-sm text-slate-400 mt-1">Cpk</div>
                                        <div className="text-xs text-emerald-400 mt-2">{interpretCpk(cpk)}</div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                                        <div className="text-3xl font-bold text-emerald-400">{cp.toFixed(2)}</div>
                                        <div className="text-sm text-slate-400 mt-1">Cp</div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
                                        <div className="text-3xl font-bold text-cyan-400">{ppk.toFixed(2)}</div>
                                        <div className="text-sm text-slate-400 mt-1">Ppk</div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
                                        <div className="text-3xl font-bold text-cyan-400">{pp.toFixed(2)}</div>
                                        <div className="text-sm text-slate-400 mt-1">Pp</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Trend Analysis Tab */}
                    <TabsContent value="trends" className="space-y-6">
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white">Parameter Performance Heatmap</CardTitle>
                                <CardDescription>Visual trend analysis across parameters</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[400px] flex items-center justify-center text-slate-400">
                                    <div className="text-center">
                                        <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <p>Heatmap visualization coming soon</p>
                                        <p className="text-sm mt-2">Real-time parameter trending across production batches</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white">Predictive Trending</CardTitle>
                                <CardDescription>Anomaly detection and forecasting</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] flex items-center justify-center text-slate-400">
                                    <div className="text-center">
                                        <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <p>AI-powered trend forecasting coming soon</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Pareto & Histogram Tab */}
                    <TabsContent value="pareto" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white">Pareto Analysis</CardTitle>
                                    <CardDescription>Defect frequency analysis (80/20 rule)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[350px]">
                                        <ParetoChart data={sampleParetoData} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <CardTitle className="text-white">Histogram</CardTitle>
                                    <CardDescription>Distribution analysis</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[350px]">
                                        <Histogram
                                            data={sampleHistogramData}
                                            lsl={97}
                                            usl={103}
                                            mean={100}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppShell>
    );
}
