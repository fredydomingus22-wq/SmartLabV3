"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, FlaskConical } from "lucide-react";
import { tokens } from "@/components/ui/design-tokens";
import Link from "next/link";

import { usePendingSamples } from "@/lib/hooks/useDashboardData";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function TechDashboard() {
    const { data: pendingSamples, isLoading } = usePendingSamples();

    const isOverdue = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        return diffInHours > 4;
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Quick Actions */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-slate-100">Ações Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link href="/production-lots" className="block">
                            <Button className="w-full justify-start" variant="outline">
                                <Plus className="mr-2 h-4 w-4" /> Novo Lote
                            </Button>
                        </Link>
                        <Link href="/lab/samples/register" className="block">
                            <Button className="w-full justify-start" variant="outline">
                                <FlaskConical className="mr-2 h-4 w-4" /> Registrar Amostra
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* My Active Tasks */}
                <Card className="bg-slate-900 border-slate-800 col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-medium text-slate-100">
                                Amostras Pendentes
                            </CardTitle>
                            <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                                {isLoading ? "..." : pendingSamples?.length || 0} pendentes
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-48 bg-slate-700" />
                                            <Skeleton className="h-3 w-32 bg-slate-700" />
                                        </div>
                                        <Skeleton className="h-8 w-20 bg-slate-700" />
                                    </div>
                                ))
                            ) : pendingSamples?.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>Nenhuma amostra pendente no momento.</p>
                                </div>
                            ) : (
                                pendingSamples?.map((sample) => {
                                    const overdue = isOverdue(sample.collectedAt);
                                    return (
                                        <div key={sample.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <FlaskConical className={`h-5 w-5 ${overdue ? "text-red-400" : `text-[${tokens.colors.amber}]`}`} />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium text-slate-200">
                                                            {sample.code} - {sample.productName}
                                                        </p>
                                                        {overdue && (
                                                            <Badge variant="destructive" className="h-5 text-[10px] px-1.5">
                                                                Atrasado
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-400">
                                                        Coletado {formatDistanceToNow(new Date(sample.collectedAt), { addSuffix: true, locale: ptBR })}
                                                        {' • '}
                                                        Tanque: {sample.tankCode}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link href={`/lab/analysis/${sample.id}`}>
                                                <Button size="sm" variant={overdue ? "destructive" : "secondary"}>
                                                    Analisar
                                                </Button>
                                            </Link>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
