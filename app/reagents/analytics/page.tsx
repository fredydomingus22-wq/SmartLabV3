"use client";

import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Calendar } from "lucide-react";
import Link from "next/link";
import { ConsumptionChart } from "@/components/reagents/analytics/ConsumptionChart";
import { StockHealthChart } from "@/components/reagents/analytics/StockHealthChart";
import { CostAnalysisChart } from "@/components/reagents/analytics/CostAnalysisChart";
import { TopReagentsChart } from "@/components/reagents/analytics/TopReagentsChart";

export default function ReagentsAnalyticsPage() {
    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/reagents">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Reagents Analytics</h1>
                            <p className="text-muted-foreground">
                                Insights on consumption, costs, and inventory health
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <Calendar className="w-4 h-4 mr-2" />
                            Last 30 Days
                        </Button>
                        <Button variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Consumption
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,245 L</div>
                            <div className="text-xs text-green-500 mt-1">
                                +12% from last month
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Monthly Cost
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$4,320</div>
                            <div className="text-xs text-red-500 mt-1">
                                +5% from budget
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Expired Waste
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12.5 L</div>
                            <div className="text-xs text-green-500 mt-1">
                                -20% from last month
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Stock Accuracy
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">98.5%</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Last audit: 2 days ago
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Consumption Trend</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ConsumptionChart />
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Stock Health Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <StockHealthChart />
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Cost Analysis by Category</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <CostAnalysisChart />
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Top 5 Most Used Reagents</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <TopReagentsChart />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppShell>
    );
}
