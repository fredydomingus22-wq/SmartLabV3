"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useLineActivity } from "@/lib/hooks/useDashboardData";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import { useRouter } from "next/navigation";

export function LineActivity() {
    const { data, isLoading, error } = useLineActivity();
    const router = useRouter();

    if (error) {
        return (
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-white">Atividade das Linhas</CardTitle>
                    <p className="text-sm text-muted-foreground">Distribuição de status por hora</p>
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
                <CardTitle className="text-lg font-bold text-white">Atividade das Linhas</CardTitle>
                <p className="text-sm text-muted-foreground">Distribuição de status por hora</p>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <ChartSkeleton height="h-[250px]" />
                ) : (
                    <>
                        <div className="flex items-center justify-center gap-6 mb-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-emerald-500"></div>
                                <span className="text-muted-foreground">Em produção</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                                <span className="text-muted-foreground">Troca</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-red-500"></div>
                                <span className="text-muted-foreground">Parada</span>
                            </div>
                        </div>
                        <div className="h-[250px] w-full cursor-pointer">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data ?? []}
                                    onClick={(state) => {
                                        if (state && state.activePayload && state.activePayload.length > 0) {
                                            const lineName = state.activePayload[0].payload.name;
                                            router.push(`/production-lots?line=${encodeURIComponent(lineName)}`);
                                        }
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis hide />
                                    <Bar dataKey="emProducao" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="troca" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="parada" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
