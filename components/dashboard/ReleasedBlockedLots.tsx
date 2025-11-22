"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useReleasedBlockedLots } from "@/lib/hooks/useDashboardData";
import { ChartSkeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function ReleasedBlockedLots() {
    const { data, isLoading, error } = useReleasedBlockedLots();

    if (error) {
        return (
            <Card className="bg-slate-900/50 border-slate-800 col-span-2">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-white">Lotes liberados x bloqueados</CardTitle>
                    <p className="text-sm text-muted-foreground">Últimos 5 dias</p>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-sm text-red-500">Falha ao carregar dados.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-900/50 border-slate-800 col-span-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold text-white">Lotes liberados x bloqueados</CardTitle>
                    <p className="text-sm text-muted-foreground">Últimos 5 dias</p>
                </div>
                <Link href="/finished-lots">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-white">
                        Ver Todos <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <ChartSkeleton height="h-[200px]" />
                ) : (
                    <>
                        <div className="flex items-center justify-center gap-6 mb-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-emerald-500"></div>
                                <span className="text-muted-foreground">Liberados</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-red-500"></div>
                                <span className="text-muted-foreground">Bloqueados</span>
                            </div>
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data ?? []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis hide />
                                    <Bar dataKey="liberados" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="bloqueados" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-5 gap-4 mt-4 text-center">
                            {(data ?? []).map((item) => (
                                <div key={item.day}>
                                    <p className="text-xs text-muted-foreground">{item.day}</p>
                                    <p className="text-sm text-emerald-500 font-medium">{item.liberados} Lib.</p>
                                    <p className="text-sm text-red-500 font-medium">{item.bloqueados} Bloq.</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
