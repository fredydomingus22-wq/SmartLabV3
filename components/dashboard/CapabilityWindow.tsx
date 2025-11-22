"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCapabilityMetrics } from "@/lib/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export function CapabilityWindow() {
    const { data, isLoading, error } = useCapabilityMetrics();

    if (error) {
        return (
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-white">Janela de Capabilidade</CardTitle>
                    <p className="text-sm text-muted-foreground">Cpk real vs taxa de OOS</p>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-sm text-red-500">Falha ao carregar dados.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white">Janela de Capabilidade</CardTitle>
                <p className="text-sm text-muted-foreground">Cpk real vs taxa de OOS</p>
            </CardHeader>
            <CardContent className="space-y-3">
                {isLoading ? (
                    <>
                        <Skeleton className="h-12 w-full bg-slate-800" />
                        <Skeleton className="h-12 w-full bg-slate-800" />
                        <Skeleton className="h-12 w-full bg-slate-800" />
                    </>
                ) : (
                    (data ?? []).map((line) => (
                        <Link
                            key={line.line}
                            href={`/product-specs?line=${encodeURIComponent(line.line)}`}
                            className="block space-y-1 hover:bg-slate-800/50 p-2 rounded transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white">{line.line}</span>
                                <span className="text-sm text-muted-foreground">Cpk {line.cpk.toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                                    style={{ width: `${Math.min((line.cpk / 2) * 100, 100)}%` }}
                                />
                            </div>
                            <span className="text-xs text-muted-foreground">OOS {line.oos}%</span>
                        </Link>
                    ))
                )}
                {!isLoading && (!data || data.length === 0) && (
                    <p className="text-center text-sm text-muted-foreground">Nenhum dado disponível.</p>
                )}
            </CardContent>
        </Card>
    );
}
