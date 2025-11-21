"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const data = [
    { name: 'Produto A', value: 25, color: '#a78bfa' },
    { name: 'Produto B', value: 30, color: '#22d3ee' },
    { name: 'Produto C', value: 20, color: '#f472b6' },
    { name: 'Produto D', value: 15, color: '#facc15' },
    { name: 'Produto E', value: 10, color: '#4ade80' },
];

export function ProductDistribution() {
    return (
        <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white">Distribuição de Produtos</CardTitle>
                <p className="text-sm text-muted-foreground">Últimas 24h</p>
            </CardHeader>
            <CardContent>
                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">Total 100 lotes monitorados</p>
            </CardContent>
        </Card>
    );
}
