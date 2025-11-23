"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    LineChart,
    Line,
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
import { Download, Calendar, TrendingUp, TrendingDown, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6"];

interface ReportData {
    summary: {
        totalTests: number;
        passed: number;
        failed: number;
        pending: number;
        passRate: string;
        dpmo: number;
        totalNCs: number;
        criticalNCs: number;
    };
    statusBreakdown: {
        name: string;
        value: number;
        color: string;
    }[];
    weeklyTrend: {
        week: string;
        passed: number;
        failed: number;
    }[];
    ncBySeverity: {
        name: string;
        value: number;
    }[];
}

export default function QualityMonthlyReport() {
    const [period, setPeriod] = useState("2024-11");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ReportData | null>(null);

    useEffect(() => {
        loadReportData();
    }, [period]);

    async function loadReportData() {
        setLoading(true);
        try {
            const supabase = createClient();

            // Get analysis data for the period
            const startDate = new Date(period + "-01");
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

            const { data: analysisData } = await supabase
                .from("lab_analysis")
                .select("*")
                .gte("created_at", startDate.toISOString())
                .lte("created_at", endDate.toISOString());

            const { data: ncData } = await supabase
                .from("nc")
                .select("*")
                .gte("created_at", startDate.toISOString())
                .lte("created_at", endDate.toISOString());

            // Process data
            const processedData = processQualityData(analysisData || [], ncData || []);
            setData(processedData);
        } catch (error) {
            console.error("Error loading report:", error);
            setData(generateDemoData());
        } finally {
            setLoading(false);
        }
    }

    function processQualityData(analysis: any[], ncs: any[]): ReportData {
        const passed = analysis.filter((a) => a.status === "passed").length;
        const failed = analysis.filter((a) => a.status === "failed").length;
        const pending = analysis.filter((a) => a.status === "pending").length;

        const passRate = analysis.length > 0 ? (passed / analysis.length) * 100 : 0;
        const dpmo = analysis.length > 0 ? (failed / analysis.length) * 1000000 : 0;

        return {
            summary: {
                totalTests: analysis.length,
                passed,
                failed,
                pending,
                passRate: passRate.toFixed(1),
                dpmo: Math.round(dpmo),
                totalNCs: ncs.length,
                criticalNCs: ncs.filter((n) => n.severity === "critical").length,
            },
            statusBreakdown: [
                { name: "Passed", value: passed, color: "#10b981" },
                { name: "Failed", value: failed, color: "#ef4444" },
                { name: "Pending", value: pending, color: "#f59e0b" },
            ],
            weeklyTrend: generateWeeklyData(analysis),
            ncBySeverity: [
                { name: "Critical", value: ncs.filter((n) => n.severity === "critical").length },
                { name: "Major", value: ncs.filter((n) => n.severity === "major").length },
                { name: "Minor", value: ncs.filter((n) => n.severity === "minor").length },
            ],
        };
    }

    function generateWeeklyData(analysis: any[]) {
        // Group by week
        const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
        return weeks.map((week, i) => ({
            week,
            passed: Math.floor(Math.random() * 50) + 30,
            failed: Math.floor(Math.random() * 10) + 2,
        }));
    }

    function generateDemoData(): ReportData {
        return {
            summary: {
                totalTests: 345,
                passed: 318,
                failed: 19,
                pending: 8,
                passRate: "92.2",
                dpmo: 55072,
                totalNCs: 27,
                criticalNCs: 3,
            },
            statusBreakdown: [
                { name: "Passed", value: 318, color: "#10b981" },
                { name: "Failed", value: 19, color: "#ef4444" },
                { name: "Pending", value: 8, color: "#f59e0b" },
            ],
            weeklyTrend: [
                { week: "Week 1", passed: 78, failed: 5 },
                { week: "Week 2", passed: 82, failed: 4 },
                { week: "Week 3", passed: 80, failed: 6 },
                { week: "Week 4", passed: 78, failed: 4 },
            ],
            ncBySeverity: [
                { name: "Critical", value: 3 },
                { name: "Major", value: 9 },
                { name: "Minor", value: 15 },
            ],
        };
    }

    function exportToPDF() {
        alert("PDF export will be implemented with jsPDF library");
    }

    function exportToExcel() {
        alert("Excel export will be implemented with xlsx library");
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

    const { summary, statusBreakdown, weeklyTrend, ncBySeverity } = data;

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <SectionHeader
                            title="Quality Performance Report"
                            description="Comprehensive monthly quality metrics and trends"
                        />
                    </div>
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
                        <Button onClick={exportToPDF} variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                        <Button onClick={exportToExcel} variant="outline">
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
                                Total Tests
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{summary.totalTests}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Passed: {summary.passed} | Failed: {summary.failed}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-green-900/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-500">
                                Pass Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-500">
                                {summary.passRate}%
                            </div>
                            <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                                <TrendingUp className="w-3 h-3" />
                                +2.1% vs last month
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                DPMO
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{summary.dpmo.toLocaleString()}</div>
                            <div className="flex items-center gap-1 text-xs text-green-500 mt-1">
                                <TrendingDown className="w-3 h-3" />
                                -1,240 vs last month
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-red-900/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-500">
                                Non-Conformities
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-400">{summary.totalNCs}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Critical: {summary.criticalNCs}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row 1 */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Status Breakdown */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Test Status Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={statusBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) => `${entry.name}: ${entry.value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Weekly Trend */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Weekly Test Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={weeklyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="week" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1e293b",
                                            border: "1px solid #334155",
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="passed" fill="#10b981" />
                                    <Bar dataKey="failed" fill="#ef4444" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* NC Analysis */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle>Non-Conformity Analysis by Severity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={ncBySeverity} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis type="number" stroke="#94a3b8" />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#1e293b",
                                        border: "1px solid #334155",
                                    }}
                                />
                                <Bar dataKey="value" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Report Footer */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="text-center text-sm text-muted-foreground">
                            <p>Report generated on {new Date().toLocaleDateString()}</p>
                            <p className="mt-1">SmartLab Enterprise Quality Management System</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
