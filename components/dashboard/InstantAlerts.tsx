"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInstantAlerts } from "@/lib/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export function InstantAlerts() {
    const { data, isLoading, error } = useInstantAlerts();

    if (error) {
        return (
            <Card className="h-full bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Alertas Instantâneos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-sm text-red-500">Falha ao carregar dados.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Alertas Instantâneos
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <>
                        <Skeleton className="h-12 w-full bg-slate-800" />
                        <Skeleton className="h-12 w-full bg-slate-800" />
                        <Skeleton className="h-12 w-full bg-slate-800" />
                    </>
                ) : (
                    <>
                        <Link href="/nc" className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0 hover:bg-slate-800/50 p-2 rounded transition-colors">
                            <div>
                                <p className="text-sm font-medium text-white">NC críticas</p>
                                <p className="text-xs text-muted-foreground">Em aberto</p>
                            </div>
                            <span className="text-xl font-bold text-red-500">{data?.criticalNC ?? 0}</span>
                        </Link>
                        <Link href="/audits" className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0 hover:bg-slate-800/50 p-2 rounded transition-colors">
                            <div>
                                <p className="text-sm font-medium text-white">Auditorias</p>
                                <p className="text-xs text-muted-foreground">Pendentes</p>
                            </div>
                            <span className="text-xl font-bold text-yellow-500">{data?.pendingAudits ?? 0}</span>
                        </Link>
                        <Link href="/trainings" className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0 hover:bg-slate-800/50 p-2 rounded transition-colors">
                            <div>
                                <p className="text-sm font-medium text-white">Treinamentos</p>
                                <p className="text-xs text-muted-foreground">Vencendo em breve</p>
                            </div>
                            <span className="text-xl font-bold text-sky-500">{data?.expiringTrainings ?? 0}</span>
                        </Link>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
