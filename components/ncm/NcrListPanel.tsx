'use client';

import { NonConformity, NcSeverity, NcStatus } from "@/lib/ncService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Filter, Search } from "lucide-react";

interface NcrListPanelProps {
    items: NonConformity[];
    selectedId?: string;
    loading?: boolean;
    filters: {
        status: NcStatus[];
        severity: NcSeverity[];
        line?: string;
        search: string;
    };
    onSelect: (id: string) => void;
    onSearch: (value: string) => void;
    onToggleStatus: (status: NcStatus) => void;
    onToggleSeverity: (severity: NcSeverity) => void;
}

const statusPalette: Record<NcStatus, string> = {
    open: "bg-amber-500/20 text-amber-200",
    in_progress: "bg-sky-500/20 text-sky-200",
    escalated: "bg-red-500/20 text-red-200",
    resolved: "bg-emerald-500/20 text-emerald-200",
    closed: "bg-emerald-600/20 text-emerald-100",
    cancelled: "bg-slate-600/20 text-slate-200",
};

const severityAccent: Record<NcSeverity, string> = {
    low: "bg-emerald-500/20 text-emerald-200",
    medium: "bg-amber-500/20 text-amber-200",
    high: "bg-orange-500/20 text-orange-100",
    critical: "bg-red-600/20 text-red-100",
};

export function NcrListPanel({
    items,
    selectedId,
    loading,
    filters,
    onSelect,
    onSearch,
    onToggleStatus,
    onToggleSeverity,
}: NcrListPanelProps) {
    return (
        <Card className="bg-slate-900/70 border-slate-800 shadow-lg backdrop-blur">
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-50">NCR Inbox</CardTitle>
                    <Badge variant="outline" className="border-slate-700 text-slate-200 gap-1">
                        <Filter size={14} />
                        Filters
                    </Badge>
                </div>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
                    <Input
                        value={filters.search}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Search NCRs by code, title, description"
                        className="pl-9 bg-slate-950/70 border-slate-800 text-slate-100 placeholder:text-slate-500"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {(["open", "in_progress", "escalated", "resolved"] as NcStatus[]).map((status) => (
                        <Button
                            key={status}
                            size="sm"
                            variant={filters.status.includes(status) ? "secondary" : "outline"}
                            className={cn(
                                "capitalize border-slate-700",
                                filters.status.includes(status) ? "bg-slate-800 text-slate-50" : "text-slate-300"
                            )}
                            onClick={() => onToggleStatus(status)}
                        >
                            {status.replace("_", " ")}
                        </Button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    {(["low", "medium", "high", "critical"] as NcSeverity[]).map((severity) => (
                        <Button
                            key={severity}
                            size="sm"
                            variant={filters.severity.includes(severity) ? "secondary" : "outline"}
                            className={cn(
                                "capitalize border-slate-700",
                                filters.severity.includes(severity) ? "bg-slate-800 text-slate-50" : "text-slate-300"
                            )}
                            onClick={() => onToggleSeverity(severity)}
                        >
                            {severity}
                        </Button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="max-h-[600px] overflow-y-auto pr-1">
                    {loading && (
                        <div className="text-slate-400 text-sm py-6 text-center">Loading NCRs...</div>
                    )}
                    {!loading && items.length === 0 && (
                        <div className="text-slate-500 text-sm py-6 text-center">
                            No NCRs found with current filters.
                        </div>
                    )}
                    <div className="space-y-2">
                        {items.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                className={cn(
                                    "w-full text-left p-3 rounded-xl border transition shadow-sm",
                                    "border-slate-800 bg-slate-900/70 hover:bg-slate-800/70",
                                    selectedId === item.id && "border-emerald-500/50 shadow-emerald-500/20"
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                        <div className="text-xs text-slate-500">{item.code ?? "NC"}</div>
                                        <div className="font-semibold text-slate-100 line-clamp-1">{item.title}</div>
                                        <div className="text-xs text-slate-400 line-clamp-2">{item.description}</div>
                                        <div className="flex gap-2">
                                            {item.severity && (
                                                <Badge className={cn("text-xs", severityAccent[item.severity])}>
                                                    {item.severity}
                                                </Badge>
                                            )}
                                            <Badge className={cn("text-xs capitalize", statusPalette[item.status])}>
                                                {item.status.replace("_", " ")}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-slate-500 space-y-1">
                                        {item.due_date && (
                                            <div>Due {new Date(item.due_date).toLocaleDateString()}</div>
                                        )}
                                        {item.line && <div>Line {item.line}</div>}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
