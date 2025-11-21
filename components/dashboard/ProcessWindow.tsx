"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const data = [
    { time: '18h', value: 11.98, target: 11.9, lie: 11.6, lse: 12.2 },
    { time: '20h', value: 11.87, target: 11.9, lie: 11.6, lse: 12.2 },
    { time: '22h', value: 11.91, target: 11.9, lie: 11.6, lse: 12.2 },
    { time: '24h', value: 11.85, target: 11.9, lie: 11.6, lse: 12.2 },
    { time: '26h', value: 11.88, target: 11.9, lie: 11.6, lse: 12.2 },
    { time: '28h', value: 11.90, target: 11.9, lie: 11.6, lse: 12.2 },
    { time: '30h', value: 11.95, target: 11.9, lie: 11.6, lse: 12.2 },
    { time: '32h', value: 11.99, target: 11.9, lie: 11.6, lse: 12.2 },
];

export function ProcessWindow() {
    return (
        <Card className="bg-slate-900/50 border-slate-800 col-span-2">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-white">Janela de Processo</CardTitle>
                        <p className="text-sm text-muted-foreground">Brix • Últimas 24h</p>
                    </div>
                    <Tabs defaultValue="brix" className="w-[400px]">
                        <TabsList className="grid w-full grid-cols-4 bg-slate-950">
                            <TabsTrigger value="brix">BRIX</TabsTrigger>
                            <TabsTrigger value="co2">CO₂</TabsTrigger>
                            <TabsTrigger value="ph">PH</TabsTrigger>
                            <TabsTrigger value="densidade">DENSIDADE</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <div className="flex items-center gap-2 mt-4">
                    <Button variant="secondary" size="sm" className="bg-slate-800 text-white hover:bg-slate-700">Últ. 24h</Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">7 dias</Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">30 dias</Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">YTD</Button>
                </div>
            </CardHeader>
            <CardContent>
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
                        <span className="text-yellow-400">LSE</span>
                    </div>
                </div>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={true} horizontal={true} />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[11.6, 12.4]} />
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
            </CardContent>
        </Card>
    );
}
