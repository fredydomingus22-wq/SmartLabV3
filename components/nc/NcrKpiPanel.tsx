'use client';

import { NonConformity } from "@/lib/ncService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, Timer, Repeat, ShieldAlert } from "lucide-react";

interface NcrKpiPanelProps {
    items: NonConformity[];
}

export function NcrKpiPanel({ items }: NcrKpiPanelProps) {
    const openCount = items.filter((nc) => nc.status === "open" || nc.status === "in_progress").length;
    const overdueCount = items.filter(
        (nc) => nc.due_date && ["open", "in_progress", "escalated"].includes(nc.status) && new Date(nc.due_date) < new Date()
    ).length;
    const escalated = items.filter((nc) => nc.status === "escalated").length;
    const recurrence = Math.min(100, Math.round((items.length ? escalated / items.length : 0) * 100));

    const cards = [
        { title: "Open NCRs", value: openCount, icon: ShieldAlert, tone: "text-amber-200" },
        { title: "Overdue", value: overdueCount, icon: Timer, tone: "text-red-200" },
        { title: "Recurrence Rate", value: `${recurrence}%`, icon: Repeat, tone: "text-sky-200" },
        { title: "Escalated", value: escalated, icon: Gauge, tone: "text-emerald-200" },
    ];

    return (
        <Card className="bg-slate-900/70 border-slate-800 shadow-lg backdrop-blur">
            <CardHeader>
                <CardTitle className="text-slate-50">Command KPIs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/70 to-slate-800/40 px-3 py-3 flex items-center justify-between"
                    >
                        <div>
                            <div className="text-sm text-slate-400">{card.title}</div>
                            <div className="text-2xl font-semibold text-slate-50">{card.value}</div>
                        </div>
                        <Badge variant="outline" className="border-slate-700 bg-slate-900/80">
                            <card.icon className={`h-4 w-4 ${card.tone}`} />
                        </Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
