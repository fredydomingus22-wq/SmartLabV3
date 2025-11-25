"use client";

import { ChartErrorBoundary } from "@/components/ui/ChartErrorBoundary";
import { ProcessWindow } from "@/components/dashboard/ProcessWindow";
import { AnalysisTotal } from "@/components/dashboard/AnalysisTotal";
import { ProductDistribution } from "@/components/dashboard/ProductDistribution";
import { LineActivity } from "@/components/dashboard/LineActivity";
import { TopAnalysts } from "@/components/dashboard/TopAnalysts";
import { ReleasedBlockedLots } from "@/components/dashboard/ReleasedBlockedLots";
import { CapabilityWindow } from "@/components/dashboard/CapabilityWindow";
import { ShiftNotes } from "@/components/dashboard/ShiftNotes";
import { ReagentStockAlerts } from "@/components/dashboard/ReagentStockAlerts";
import { ProductionTrendChart } from "@/components/dashboard/ProductionTrendChart";
import { QualityMetricsOverview } from "@/components/dashboard/QualityMetricsOverview";
import { InstantAlerts } from "@/components/dashboard/InstantAlerts";
import { KPIPremiumCard } from "@/components/dashboard/KPIPremiumCard";
import {
    CheckCircle2,
    AlertTriangle,
    Activity,
    Clock,
    GraduationCap,
    Package
} from "lucide-react";

interface DashboardMetrics {
    releasedCount: number;
    ncCount: number;
    pccPrecision: string;
    avgTurnaround: string;
    trainingsCount: number;
    quarantineCount: number;
}

interface ManagerDashboardProps {
    metrics: DashboardMetrics | null;
    loading: boolean;
}

export function ManagerDashboard({ metrics, loading }: ManagerDashboardProps) {
    return (
        <div className="space-y-6">
            {/* KPI Grid - Premium Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <KPIPremiumCard
                    title="Lotes Liberados"
                    value={loading ? "..." : metrics?.releasedCount.toString() || "0"}
                    subtitle="Últimas 24h"
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    trend={{ value: "+6%", positive: true }}
                    color="emerald"
                    loading={loading}
                />

                <KPIPremiumCard
                    title="NCs Abertas"
                    value={loading ? "..." : metrics?.ncCount.toString() || "0"}
                    subtitle="Aguardam resolução"
                    icon={<AlertTriangle className="h-5 w-5" />}
                    trend={{ value: "-1", positive: true }}
                    color="amber"
                    loading={loading}
                />

                <KPIPremiumCard
                    title="Precisão PCC"
                    value={loading ? "..." : metrics?.pccPrecision || "0%"}
                    subtitle="Últimas 72h"
                    icon={<Activity className="h-5 w-5" />}
                    color="cyan"
                    loading={loading}
                />

                <KPIPremiumCard
                    title="Lab Turnaround"
                    value={loading ? "..." : metrics?.avgTurnaround || "0 min"}
                    subtitle="Target 45 min"
                    icon={<Clock className="h-5 w-5" />}
                    trend={{ value: "-3 min", positive: true }}
                    color="emerald"
                    loading={loading}
                />

                <KPIPremiumCard
                    title="Treinamentos"
                    value={loading ? "..." : metrics?.trainingsCount.toString() || "0"}
                    subtitle="Ativos no sistema"
                    icon={<GraduationCap className="h-5 w-5" />}
                    color="sky"
                    loading={loading}
                />

                <KPIPremiumCard
                    title="Mat. Quarentena"
                    value={loading ? "..." : metrics?.quarantineCount.toString() || "0"}
                    subtitle="Aguardam COA"
                    icon={<Package className="h-5 w-5" />}
                    trend={{ value: "+2", positive: false }}
                    color="amber"
                    loading={loading}
                />
            </div>

            {/* Alert Banner */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <ChartErrorBoundary>
                        <ProcessWindow />
                    </ChartErrorBoundary>
                </div>
                <InstantAlerts />
            </div>

            {/* Priority Widgets Row */}
            <div className="grid gap-6 md:grid-cols-3">
                <ChartErrorBoundary>
                    <ReagentStockAlerts />
                </ChartErrorBoundary>
                <ChartErrorBoundary>
                    <ProductionTrendChart />
                </ChartErrorBoundary>
                <ChartErrorBoundary>
                    <QualityMetricsOverview />
                </ChartErrorBoundary>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
                <ChartErrorBoundary>
                    <ProductDistribution />
                </ChartErrorBoundary>
                <ChartErrorBoundary>
                    <LineActivity />
                </ChartErrorBoundary>
            </div>

            {/* Analysis and Analysts */}
            <div className="grid gap-6 md:grid-cols-3">
                <AnalysisTotal />
                <ChartErrorBoundary>
                    <ReleasedBlockedLots />
                </ChartErrorBoundary>
                <div className="space-y-6">
                    <CapabilityWindow />
                    <ShiftNotes />
                </div>
            </div>

            {/* Top Analysts */}
            <TopAnalysts />
        </div>
    );
}
