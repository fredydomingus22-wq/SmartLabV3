"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartSkeleton } from "@/components/ui/Skeleton";
import { useProcessData } from "@/lib/hooks/useDashboardData";

type Parameter = 'brix' | 'co2' | 'ph' | 'densidade';
type TimeRange = '24h' | '7d' | '30d' | 'ytd';

const parameterLabels = {
    brix: 'Brix',
    co2: 'CO₂',
    ph: 'PH',
    densidade: 'Densidade',
};

export function ProcessWindow() {
    const [activeParameter, setActiveParameter] = useState<Parameter>('brix');
    const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>('24h');

    const { data, isLoading, error } = useProcessData(activeParameter, activeTimeRange);

    const chartData = data ?? [];

    return (
        <Card className="bg-slate-900/50 border-slate-800 col-span-2">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-white">Janela de Processo</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {parameterLabels[activeParameter]} • Últimas {activeTimeRange === '24h' ? '24h' : activeTimeRange === '7d' ? '7 dias' : activeTimeRange === '30d' ? '30 dias' : 'YTD'}
                        </p>
                    </div>
                    <Tabs value={activeParameter} onValueChange={(value) => setActiveParameter(value as Parameter)} className="w-[400px]">
                        <TabsList className="grid w-full grid-cols-4 bg-slate-950">
                            <TabsTrigger value="brix">BRIX</TabsTrigger>
                            <TabsTrigger value="co2">CO₂</TabsTrigger>
                            <TabsTrigger value="ph">PH</TabsTrigger>
                            <TabsTrigger value="densidade">DENSIDADE</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <div className="flex items-center gap-2 mt-4">
                    <Button
                        variant={activeTimeRange === '24h' ? 'secondary' : 'ghost'}
                        size="sm"
                        className={activeTimeRange === '24h' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'text-muted-foreground hover:text-white'}
                        onClick={() => setActiveTimeRange('24h')}
                    >
                        Últ. 24h
                    </Button>
                    <Button
                        variant={activeTimeRange === '7d' ? 'secondary' : 'ghost'}
                        size="sm"
                        className={activeTimeRange === '7d' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'text-muted-foreground hover:text-white'}
                        onClick={() => setActiveTimeRange('7d')}
                    >
                        7 dias
                    </Button>
                    <Button
                        variant={activeTimeRange === '30d' ? 'secondary' : 'ghost'}
                        size="sm"
                        className={activeTimeRange === '30d' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'text-muted-foreground hover:text-white'}
                        onClick={() => setActiveTimeRange('30d')}
                    >
                        30 dias
                    </Button>
                    <Button
                        variant={activeTimeRange === 'ytd' ? 'secondary' : 'ghost'}
                        size="sm"
                        className={activeTimeRange === 'ytd' ? 'bg-slate-800 text-white hover:bg-slate-700' : 'text-muted-foreground hover:text-white'}
                        onClick={() => setActiveTimeRange('ytd')}
                    >
                        YTD
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <ChartSkeleton height="h-[250px]" />
                ) : (
                    <>
                        <div className="flex items-center justify-center gap-6 mb-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                <span className="text-purple-400">Valor</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                                <span className="text-cyan-400">Alvo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                <span className="text-yellow-400">LIE</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                <span className="text-yellow-4 00">LSE</span>
                            </div>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={true} horizontal={true} />
                                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="#c084fc" strokeWidth={2} dot={{ r: 4, fill: "#c084fc" }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="target" stroke="#22d3ee" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: "#22d3ee" }} />
                                    <Line type="monotone" dataKey="lie" stroke="#facc15" strokeWidth={1} strokeDasharray="3 3" dot={{ r: 3, fill: "#facc15" }} />
                                    <Line type="monotone" dataKey="lse" stroke="#facc15" strokeWidth={1} strokeDasharray="3 3" dot={{ r: 3, fill: "#facc15" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
