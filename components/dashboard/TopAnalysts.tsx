"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTopAnalysts } from "@/lib/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export function TopAnalysts() {
    const { data, isLoading, error } = useTopAnalysts();

    if (error) {
        return (
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-white">Top 3 Analistas – Mês</CardTitle>
                    <p className="text-sm text-muted-foreground">Rankeados por análises registradas</p>
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
                <CardTitle className="text-lg font-bold text-white">Top 3 Analistas – Mês</CardTitle>
                <p className="text-sm text-muted-foreground">Rankeados por análises registradas</p>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <>
                        <Skeleton className="h-10 w-full bg-slate-800" />
                        <Skeleton className="h-10 w-full bg-slate-800" />
                        <Skeleton className="h-10 w-full bg-slate-800" />
                    </>
                ) : (
                    (data ?? []).map((analyst, index) => (
                        <Link
                            key={analyst.id}
                            href={`/lab-tests?analyst=${analyst.id}`}
                            className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0 hover:bg-slate-800/50 p-2 rounded transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-sky-400">#{index + 1}</span>
                                <span className="text-sm font-medium text-white">{analyst.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{analyst.count} análises</span>
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
