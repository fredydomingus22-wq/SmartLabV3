"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    TrendingUp,
    FlaskConical,
    BarChart3,
    Calendar,
    Download,
    Eye,
    Clock,
    Users,
    Package,
    Loader2,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface ReportTemplate {
    id: string;
    title: string;
    description: string;
    icon: any;
    frequency: string;
    category: "quality" | "production" | "inventory" | "compliance";
    path: string;
    color: string;
}

interface GeneratedReport {
    id: string;
    name: string;
    date: string;
    type: string;
    format: string;
}

// Report templates are navigation config - acceptable to keep static
const reportTemplates: ReportTemplate[] = [
    {
        id: "quality-monthly",
        title: "Quality Performance Report",
        description: "Monthly overview of quality metrics, pass rates, NCs, and DPMO trends",
        icon: BarChart3,
        frequency: "Monthly",
        category: "quality",
        path: "/reports/quality-monthly",
        color: "bg-blue-600",
    },
    {
        id: "production-weekly",
        title: "Production Summary",
        description: "Weekly production volumes, efficiency, and target achievement",
        icon: TrendingUp,
        frequency: "Weekly",
        category: "production",
        path: "/reports/production-weekly",
        color: "bg-green-600",
    },
    {
        id: "reagent-consumption",
        title: "Reagent Consumption",
        description: "Reagent usage analysis, stock levels, and cost tracking",
        icon: FlaskConical,
        frequency: "Monthly",
        category: "inventory",
        path: "/reports/reagent-consumption",
        color: "bg-purple-600",
    },
    {
        id: "nc-analysis",
        title: "Non-Conformity Analysis",
        description: "NC trends, root causes, and corrective action effectiveness",
        icon: FileText,
        frequency: "Monthly",
        category: "quality",
        path: "/reports/nc-analysis",
        color: "bg-red-600",
    },
    {
        id: "audit-trail",
        title: "Audit Trail Report",
        description: "Complete audit log with user actions and system changes",
        icon: Clock,
        frequency: "On-demand",
        category: "compliance",
        path: "/reports/audit-trail",
        color: "bg-orange-600",
    },
    {
        id: "shift-daily",
        title: "Daily Shift Report",
        description: "Complete shift summary: production, analysis, line status, and CIP records",
        icon: Users,
        frequency: "Daily",
        category: "production",
        path: "/reports/shift-daily",
        color: "bg-cyan-600",
    },
    {
        id: "production-lot",
        title: "Production Lot Traceability",
        description: "Complete lot history with intermediates, ingredients, and analysis",
        icon: Package,
        frequency: "On-demand",
        category: "compliance",
        path: "/reports/production-lot/select",
        color: "bg-indigo-600",
    },
];

const categoryColors = {
    quality: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    production: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    inventory: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    compliance: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);
    const [stats, setStats] = useState({
        lastGenerated: '-',
        lastGeneratedType: '',
        scheduledThisWeek: 0
    });
    const supabase = createClient();

    useEffect(() => {
        loadReportData();
    }, []);

    const loadReportData = async () => {
        try {
            setLoading(true);

            // Try to fetch from generated_reports table if it exists
            const { data: reports, error } = await supabase
                .from('generated_reports')
                .select('id, name, type, format, created_at')
                .order('created_at', { ascending: false })
                .limit(5);

            if (!error && reports && reports.length > 0) {
                setRecentReports(reports.map(r => ({
                    id: r.id,
                    name: r.name,
                    date: r.created_at,
                    type: r.type,
                    format: r.format
                })));

                // Calculate stats from real data
                const today = new Date();
                const lastReport = reports[0];
                const lastDate = new Date(lastReport.created_at);
                const isToday = lastDate.toDateString() === today.toDateString();

                setStats({
                    lastGenerated: isToday ? 'Today' : lastDate.toLocaleDateString(),
                    lastGeneratedType: lastReport.type,
                    scheduledThisWeek: 0 // Would need a scheduled_reports table
                });
            }
        } catch (error) {
            // Table might not exist yet - show empty state
            console.log('Generated reports table not available');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Reports & Analytics"
                    description="Generate comprehensive reports and export data for analysis"
                />

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Available Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reportTemplates.length}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Last Generated
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.lastGenerated}</div>
                            {stats.lastGeneratedType && (
                                <div className="text-xs text-muted-foreground mt-1">{stats.lastGeneratedType}</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Scheduled
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.scheduledThisWeek}</div>
                            <div className="text-xs text-muted-foreground mt-1">This week</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Export Formats
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Badge variant="outline">PDF</Badge>
                                <Badge variant="outline">Excel</Badge>
                                <Badge variant="outline">CSV</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Report Templates */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {reportTemplates.map((report) => {
                        const Icon = report.icon;
                        return (
                            <Card
                                key={report.id}
                                className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors"
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-2">
                                        <div
                                            className={`p-3 rounded-lg ${report.color} bg-opacity-10`}
                                        >
                                            <Icon className={`w-6 h-6 ${report.color.replace("bg-", "text-")}`} />
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={categoryColors[report.category]}
                                        >
                                            {report.category}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg">{report.title}</CardTitle>
                                    <CardDescription className="text-sm">
                                        {report.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            {report.frequency}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={report.path} className="flex-1">
                                            <Button variant="outline" className="w-full" size="sm">
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Report
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="sm">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Recent Reports */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle>Recent Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : recentReports.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
                                <p className="text-sm text-muted-foreground">No reports generated yet</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Generated reports will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentReports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-blue-500" />
                                            <div>
                                                <div className="font-medium">{report.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Generated: {new Date(report.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{report.type}</Badge>
                                            <Badge variant="outline">{report.format}</Badge>
                                            <Button variant="ghost" size="sm">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
