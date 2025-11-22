"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpcAlert } from "@/types/spc";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, ShieldAlert } from "lucide-react";

type Props = {
    alerts: SpcAlert[];
    onAcknowledge?: (id: string) => void;
    onClose?: (id: string) => void;
};

const severityColor: Record<SpcAlert["severity"], string> = {
    info: "bg-sky-900/50 text-sky-200 border-sky-700",
    warning: "bg-amber-900/40 text-amber-200 border-amber-700",
    critical: "bg-red-900/40 text-red-100 border-red-700"
};

export function SpcAlertFeed({ alerts, onAcknowledge, onClose }: Props) {
    return (
        <Card className="bg-slate-900/80 border-slate-800 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-slate-100">Live Alerts</CardTitle>
                    <p className="text-slate-400 text-sm">SPC violations and predictive warnings</p>
                </div>
                <ShieldAlert className="h-5 w-5 text-amber-400" />
            </CardHeader>
            <CardContent className="space-y-3">
                {alerts.length === 0 && (
                    <div className="text-sm text-slate-400">No open alerts. Process stable.</div>
                )}
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className="border border-slate-800 rounded-lg p-3 bg-slate-950/40 flex items-start justify-between gap-3"
                    >
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge className={severityColor[alert.severity]}>{alert.severity.toUpperCase()}</Badge>
                                <span className="text-xs text-slate-500">
                                    {formatDistanceToNow(new Date(alert.triggered_at), { addSuffix: true })}
                                </span>
                            </div>
                            <p className="text-sm text-slate-100">{alert.message}</p>
                            <p className="text-xs text-slate-500">
                                Type: {alert.type} • Status: {alert.status}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            {onAcknowledge && alert.status === "open" && (
                                <Button size="sm" variant="outline" onClick={() => onAcknowledge(alert.id)}>
                                    Acknowledge
                                </Button>
                            )}
                            {onClose && (
                                <Button size="sm" variant="ghost" onClick={() => onClose(alert.id)}>
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Close
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
