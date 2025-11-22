"use client";

import { useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SpcFiltersBar } from "@/components/spc/SpcFiltersBar";
import { SpcMainChart } from "@/components/spc/SpcMainChart";
import { SpcKpiPanel } from "@/components/spc/SpcKpiPanel";
import { SpcAlertFeed } from "@/components/spc/SpcAlertFeed";
import { SpcBottomAnalytics } from "@/components/spc/SpcBottomAnalytics";
import { useSpcWarRoom } from "./useSpcWarRoom";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function SpcWarRoomPage() {
    const {
        filters,
        setFilters,
        analysis,
        alerts,
        predictions,
        loading,
        error,
        refresh,
        acknowledge,
        close
    } = useSpcWarRoom();

    const statusBadge = useMemo(() => {
        if (!analysis || analysis.violations.length === 0) {
            return <Badge className="bg-emerald-900/50 text-emerald-200 border-emerald-700">Stable</Badge>;
        }
        return <Badge className="bg-amber-900/40 text-amber-200 border-amber-700">Attention</Badge>;
    }, [analysis]);

    const handleFilterChange = (next: Partial<typeof filters>) => {
        setFilters((prev) => {
            const updated = { ...prev, ...next };
            const normalize = (value?: string) => (value === "all" ? undefined : value);
            return {
                ...updated,
                parameterId: normalize(updated.parameterId),
                line: normalize(updated.line),
                productId: normalize(updated.productId)
            };
        });
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <SectionHeader title="SPC WAR ROOM" description="Real-time SPC + predictive control" />
                    <div className="flex items-center gap-2">
                        {statusBadge}
                        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Refresh
                        </Button>
                    </div>
                </div>

                <SpcFiltersBar filters={filters} onChange={handleFilterChange} onRefresh={refresh} />

                {error && (
                    <div className="flex items-center gap-2 text-amber-300 bg-amber-900/30 border border-amber-800 p-3 rounded-lg">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}

                {analysis ? (
                    <>
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="xl:col-span-2 space-y-4">
                                <SpcMainChart
                                    title="Critical Parameter Control"
                                    subtitle="Live I-MR with predictive band"
                                    analysis={analysis}
                                    predictions={predictions}
                                />
                                <SpcKpiPanel analysis={analysis} predictions={predictions} />
                            </div>
                            <div className="space-y-4">
                                <SpcAlertFeed alerts={alerts} onAcknowledge={acknowledge} onClose={close} />
                            </div>
                        </div>

                        <Separator className="bg-slate-800" />

                        <SpcBottomAnalytics analysis={analysis} />
                    </>
                ) : (
                    <div className="text-slate-400 text-sm">No SPC data yet for the selected filters.</div>
                )}
            </div>
        </AppShell>
    );
}
