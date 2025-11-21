"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const data = [
    { day: 'Seg', liberados: 18, bloqueados: 1 },
    { day: 'Ter', liberados: 17, bloqueados: 2 },
    { day: 'Qua', liberados: 20, bloqueados: 0 },
    { day: 'Qui', liberados: 19, bloqueados: 1 },
    { day: 'Sex', liberados: 22, bloqueados: 2 },
    { day: 'Sáb', liberados: 24, bloqueados: 0 },
];

export function ReleasedBlockedLots() {
    return (
        <Card className="bg-slate-900/50 border-slate-800 col-span-2">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white">Lotes liberados x bloqueados</CardTitle>
                <p className="text-sm text-muted-foreground">Últimos 5 dias</p>
            </CardHeader>
            <CardContent>
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
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Bar dataKey="liberados" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="bloqueados" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-6 gap-4 mt-4 text-center">
                    {data.map((item) => (
                        <div key={item.day}>
                            <p className="text-xs text-muted-foreground">{item.day}</p>
                            <p className="text-sm text-emerald-500 font-medium">Liberados {item.liberados}</p>
                            <p className="text-sm text-red-500 font-medium">Bloqueados {item.bloqueados}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
