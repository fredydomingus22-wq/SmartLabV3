import { AppShell } from "@/components/layout/AppShell";
import { ChartErrorBoundary } from "@/components/ui/ChartErrorBoundary";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { InstantAlerts } from "@/components/dashboard/InstantAlerts";
import { ProcessWindow } from "@/components/dashboard/ProcessWindow";
import { AnalysisTotal } from "@/components/dashboard/AnalysisTotal";
import { ProductDistribution } from "@/components/dashboard/ProductDistribution";
import { LineActivity } from "@/components/dashboard/LineActivity";
import { KPICard } from "@/components/dashboard/KPICard";
import { TopAnalysts } from "@/components/dashboard/TopAnalysts";
import { ReleasedBlockedLots } from "@/components/dashboard/ReleasedBlockedLots";
import { CapabilityWindow } from "@/components/dashboard/CapabilityWindow";
import { ShiftNotes } from "@/components/dashboard/ShiftNotes";
import { ReagentStockAlerts } from "@/components/dashboard/ReagentStockAlerts";
import { ProductionTrendChart } from "@/components/dashboard/ProductionTrendChart";
import { QualityMetricsOverview } from "@/components/dashboard/QualityMetricsOverview";

export default function DashboardPage() {
    return (
        <AppShell>
            <div className="p-6 space-y-6 bg-slate-950">
                {/* Welcome Section */}
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <WelcomeSection />
                    </div>
                    <InstantAlerts />
                </div>

                {/* NEW: Priority Widgets - Reagents, Production, Quality */}
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

                {/* Process Window and Analysis Total */}
                <div className="grid gap-6 md:grid-cols-3">
                    <ChartErrorBoundary>
                        <ProcessWindow />
                    </ChartErrorBoundary>
                    <AnalysisTotal />
                </div>

                {/* Product Distribution and Line Activity */}
                <div className="grid gap-6 md:grid-cols-2">
                    <ChartErrorBoundary>
                        <ProductDistribution />
                    </ChartErrorBoundary>
                    <ChartErrorBoundary>
                        <LineActivity />
                    </ChartErrorBoundary>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <KPICard
                        title="Lotes Liberados (24h)"
                        value="48"
                        subtitle="Target 45 min"
                        trend={{
                            value: "+6%",
                            direction: "up",
                            label: "vs semana passada"
                        }}
                    />
                    <KPICard
                        title="NCs Críticas"
                        value="3"
                        subtitle="2 aguardando 8D"
                        trend={{
                            value: "-1",
                            direction: "down",
                            label: "vs período anterior"
                        }}
                    />
                    <KPICard
                        title="Precisão PCC"
                        value="98.4%"
                        subtitle="Últimas 72h"
                    />
                    <KPICard
                        title="Lab Turnaround"
                        value="42 min"
                        subtitle="Target 45 min"
                    />
                    <KPICard
                        title="Treinamentos Ativos"
                        value="11"
                        subtitle="4 vencendo em 7 dias"
                    />
                    <KPICard
                        title="Materiais em Quarentena"
                        value="5"
                        subtitle="Todos aguardam COA"
                        trend={{
                            value: "+2",
                            direction: "up",
                            label: "vs período anterior"
                        }}
                    />
                </div>

                {/* Bottom Section */}
                <div className="grid gap-6 md:grid-cols-3">
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
        </AppShell>
    );
}
