"use client";

import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

export function SupervisorDashboard() {
    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Lotes em Produção"
                    value="8"
                    icon={Clock}
                    trend="up"
                    trendValue="+2"
                    description="vs ontem"
                />
                <StatCard
                    title="Alertas Críticos"
                    value="3"
                    icon={AlertTriangle}
                    trend="up"
                    trendValue="+1"
                    description="novos"
                />
                <StatCard
                    title="Aprovações Pendentes"
                    value="12"
                    icon={CheckCircle}
                    trend="neutral"
                />
            </div>

            {/* Approvals List */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg font-medium text-slate-100">Aprovações Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                                <div>
                                    <p className="text-sm font-medium text-slate-200">Liberação de Lote - #2024-00{i}</p>
                                    <p className="text-xs text-slate-500">Solicitado por João Silva • Há 2h</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="text-xs text-emerald-400 hover:text-emerald-300 font-medium">Aprovar</button>
                                    <button className="text-xs text-red-400 hover:text-red-300 font-medium">Rejeitar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
