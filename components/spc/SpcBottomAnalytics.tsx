"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SPCAnalysisResult } from "@/types/spc";
import { Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
    analysis: SPCAnalysisResult;
};

type BoxStats = {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
};

function computeBox(data: number[]): BoxStats {
    if (data.length === 0) {
        return { min: 0, q1: 0, median: 0, q3: 0, max: 0 };
    }

    const sorted = [...data].sort((a, b) => a - b);
    const q = (p: number) => {
        const pos = (sorted.length - 1) * p;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (sorted[base + 1] !== undefined) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        }
        return sorted[base];
    };
    return {
        min: sorted[0],
        q1: q(0.25),
        median: q(0.5),
        q3: q(0.75),
        max: sorted[sorted.length - 1]
    };
}

export function SpcBottomAnalytics({ analysis }: Props) {
    const histogram = analysis.data.reduce<Record<string, number>>((acc, point) => {
        const bucket = (Math.round(point.value * 2) / 2).toFixed(1);
        acc[bucket] = (acc[bucket] || 0) + 1;
        return acc;
    }, {});

    const histogramData = Object.entries(histogram).map(([bucket, count]) => ({ bucket, count }));

    const paretoData = analysis.violations.reduce<Record<string, number>>((acc, v) => {
        acc[v.ruleName] = (acc[v.ruleName] || 0) + 1;
        return acc;
    }, {});
    const paretoSeries = Object.entries(paretoData).map(([rule, count]) => ({ rule, count }));

    const box = computeBox(analysis.data.map((d) => d.value));

    return (
        <Card className="bg-slate-900/80 border-slate-800">
            <CardHeader>
                <CardTitle className="text-slate-100">Data & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="data" className="w-full">
                    <TabsList className="bg-slate-900 border border-slate-800">
                        <TabsTrigger value="data">Data</TabsTrigger>
                        <TabsTrigger value="histogram">Histogram</TabsTrigger>
                        <TabsTrigger value="pareto">Pareto</TabsTrigger>
                        <TabsTrigger value="boxplot">Boxplot</TabsTrigger>
                    </TabsList>

                    <TabsContent value="data" className="pt-4">
                        <div className="max-h-72 overflow-auto border border-slate-800 rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Label</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analysis.data.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.label ?? row.id}</TableCell>
                                            <TableCell>{row.value.toFixed(3)}</TableCell>
                                            <TableCell>{new Date(row.timestamp).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="histogram" className="pt-4">
                        <div style={{ height: 260 }}>
                            <ResponsiveContainer>
                                <BarChart data={histogramData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="bucket" tick={{ fill: "#94a3b8" }} />
                                    <YAxis tick={{ fill: "#94a3b8" }} allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }} />
                                    <Bar dataKey="count" fill="#38bdf8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>

                    <TabsContent value="pareto" className="pt-4">
                        <div style={{ height: 260 }}>
                            <ResponsiveContainer>
                                <ComposedChart data={paretoSeries}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="rule" tick={{ fill: "#94a3b8" }} />
                                    <YAxis tick={{ fill: "#94a3b8" }} allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }} />
                                    <Bar dataKey="count" barSize={32} fill="#f97316" />
                                    <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>

                    <TabsContent value="boxplot" className="pt-4">
                        <div className="grid grid-cols-5 gap-3">
                            {[
                                { label: "Min", value: box.min },
                                { label: "Q1", value: box.q1 },
                                { label: "Median", value: box.median },
                                { label: "Q3", value: box.q3 },
                                { label: "Max", value: box.max }
                            ].map((item) => (
                                <Card key={item.label} className="bg-slate-950/40 border-slate-800">
                                    <CardContent className="p-3">
                                        <p className="text-xs text-slate-500">{item.label}</p>
                                        <p className="text-lg text-slate-100">{item.value.toFixed(3)}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
