"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAnalysisTotal } from "@/lib/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useState } from "react";

export function AnalysisTotal() {
    const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
    const { data, isLoading, error } = useAnalysisTotal(period);

    return (
        <Card className="bg-slate-900/50 border-slate-800 h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white">Total de Análises</CardTitle>
                <p className="text-sm text-muted-foreground">
                    {period === "daily" ? "Últimas 24h" : period === "weekly" ? "Últimos 7 dias" : "Últimos 30 dias"}
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                    <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-white">
                        <SelectValue placeholder="Selecione período" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                </Select>

                <Link href="/lab-tests" className="block hover:opacity-80 transition-opacity">
                    {isLoading ? (
                        <Skeleton className="h-16 w-24 bg-slate-800" />
                    ) : error ? (
                        <p className="text-sm text-red-500">Erro</p>
                    ) : (
                        <div className="text-5xl font-bold text-white">{data ?? 0}</div>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">Ensaios sincronizados com LIMS SmartLab.</p>
                </Link>
            </CardContent>
        </Card>
    );
}
