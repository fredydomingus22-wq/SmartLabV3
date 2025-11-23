'use client';

import { NcAction } from "@/lib/ncService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, UserRound, CalendarClock } from "lucide-react";

interface NcrCapaPanelProps {
    actions?: NcAction[];
    onAddAction?: () => void;
}

const statusTone: Record<NcAction["status"], string> = {
    open: "bg-amber-500/20 text-amber-100",
    in_progress: "bg-sky-500/20 text-sky-100",
    done: "bg-emerald-500/20 text-emerald-100",
    overdue: "bg-red-500/20 text-red-100",
    cancelled: "bg-slate-600/20 text-slate-100",
};

export function NcrCapaPanel({ actions = [], onAddAction }: NcrCapaPanelProps) {
    return (
        <Card className="bg-slate-900/70 border-slate-800 shadow-lg backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-slate-50">CAPA Tasks</CardTitle>
                <Button size="sm" variant="secondary" className="bg-slate-800 text-slate-50" onClick={onAddAction}>
                    <Plus size={16} className="mr-1" /> New
                </Button>
            </CardHeader>
            <CardContent className="space-y-3">
                {actions.map((action) => (
                    <div
                        key={action.id}
                        className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 space-y-2"
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-slate-100 font-semibold">{action.title}</div>
                            <Badge className={statusTone[action.status]}>{action.status}</Badge>
                        </div>
                        {action.description && <div className="text-sm text-slate-400">{action.description}</div>}
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                                <UserRound size={14} />
                                {action.owner_id ? `Owner ${action.owner_id.slice(0, 6)}` : "Unassigned"}
                            </span>
                            {action.due_date && (
                                <span className="inline-flex items-center gap-1">
                                    <CalendarClock size={14} />
                                    Due {new Date(action.due_date).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
                {actions.length === 0 && (
                    <div className="text-slate-500 text-sm">No CAPA actions yet. Add the first task.</div>
                )}
            </CardContent>
        </Card>
    );
}
