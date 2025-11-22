"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardMetrics } from "@/lib/hooks/useDashboardData";
import { KPICard } from "./KPICard";
import { KPISkeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export function WelcomeSection() {
    const { data, isLoading } = useDashboardMetrics();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-sm text-muted-foreground">Bem-vindo de volta,</p>
                    <h1 className="text-3xl font-bold text-white">Analista!</h1>
                    <p className="text-muted-foreground">Aqui está o seu Resumo da Qualidade SmartLab</p>
                </div>
                <div className="w-[200px]">
                    <Select defaultValue="all">
                        <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-white h-9">
                            <SelectValue placeholder="Selecione SKU" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os SKUs</SelectItem>
                            <SelectItem value="sku1">SKU 1</SelectItem>
                            <SelectItem value="sku2">SKU 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                {isLoading ? (
                    <>
                        <KPISkeleton />
                        <KPISkeleton />
                        <KPISkeleton />
                        <KPISkeleton />
                    </>
                ) : (
                    <>
                        <Link href="/finished-lots">
                            <KPICard
                                title="Lotes Liberados"
                                value={data?.releasedCount ?? 0}
                                subtitle="Últimas 24h"
                                trend={{ value: "+5%", direction: "up", label: "vs ontem" }}
                            />
                        </Link>
                        <Link href="/nc">
                            <KPICard
                                title="NCs Críticas"
                                value={data?.ncCount ?? 0}
                                subtitle="Em aberto"
                                trend={{ value: "-2", direction: "down", label: "vs semana passada" }}
                            />
                        </Link>
                        <Link href="/food-safety">
                            <KPICard
                                title="Precisão PCC"
                                value={data?.pccPrecision ?? "0%"}
                                subtitle="Últimas 72h"
                            />
                        </Link>
                        <Link href="/lab-tests">
                            <KPICard
                                title="Turnaround Médio"
                                value={data?.avgTurnaround ?? "0 min"}
                                subtitle="Tempo de análise"
                            />
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
