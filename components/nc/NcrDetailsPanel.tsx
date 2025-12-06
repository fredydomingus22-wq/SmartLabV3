'use client';

import { NonConformity, NcRootCause } from "@/lib/ncService";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Paperclip, Clock3, MapPin, AlertTriangle, CheckCircle2 } from "lucide-react";

interface NcrDetailsPanelProps {
    ncr?: NonConformity;
    timeline?: { label: string; at: string; type: "info" | "risk" | "success" }[];
    attachments?: { name: string; url?: string; type?: string; uploaded_at?: string }[];
    rcaSlot?: React.ReactNode;
    rootCauses?: NcRootCause[];
}

const timelineIcons = {
    info: <Clock3 className="text-slate-400 h-4 w-4" />,
    risk: <AlertTriangle className="text-amber-400 h-4 w-4" />,
    success: <CheckCircle2 className="text-emerald-400 h-4 w-4" />,
};

export function NcrDetailsPanel({ ncr, timeline = [], attachments = [], rcaSlot, rootCauses = [] }: NcrDetailsPanelProps) {
    if (!ncr) {
        return (
            <Card className="bg-slate-900/70 border-slate-800 backdrop-blur">
                <CardContent className="py-16 text-center text-slate-500">
                    Select an NCR to view details.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-900/70 border-slate-800 shadow-lg backdrop-blur">
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-slate-50">{ncr.title}</CardTitle>
                        <div className="text-sm text-slate-400">Code {ncr.code ?? "NC"}</div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Badge variant="outline" className="border-slate-700 text-slate-200 capitalize">
                            {ncr.status.replace("_", " ")}
                        </Badge>
                        {ncr.severity && (
                            <Badge className="bg-red-500/20 text-red-100 border-red-500/40 capitalize">
                                {ncr.severity} severity
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    {ncr.line && (
                        <span className="inline-flex items-center gap-1">
                            <MapPin size={14} /> Line {ncr.line}
                        </span>
                    )}
                    {ncr.shift && <span className="inline-flex items-center gap-1">Shift {ncr.shift}</span>}
                    {ncr.due_date && <span className="inline-flex items-center gap-1">Due {new Date(ncr.due_date).toLocaleString()}</span>}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <div className="text-xs uppercase text-slate-500 mb-2">Description</div>
                    <p className="text-slate-200 leading-relaxed">
                        {ncr.description || "No description provided."}
                    </p>
                </div>

                <Separator className="bg-slate-800" />

                <div className="space-y-3">
                    <div className="text-xs uppercase text-slate-500">Timeline</div>
                    <div className="space-y-2">
                        {timeline.map((event) => (
                            <div
                                key={event.label + event.at}
                                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
                            >
                                <div className="flex items-center gap-2 text-slate-200">
                                    {timelineIcons[event.type]}
                                    <span>{event.label}</span>
                                </div>
                                <span className="text-xs text-slate-500">{new Date(event.at).toLocaleString()}</span>
                            </div>
                        ))}
                        {timeline.length === 0 && (
                            <div className="text-slate-500 text-sm">No events logged yet.</div>
                        )}
                    </div>
                </div>

                <Separator className="bg-slate-800" />

                <div className="space-y-3">
                    <div className="text-xs uppercase text-slate-500">Attachments</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {attachments.map((file) => (
                            <div
                                key={file.name}
                                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
                            >
                                <div className="rounded-md bg-slate-800/70 p-2">
                                    <Paperclip size={16} className="text-slate-300" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-slate-200">{file.name}</div>
                                    <div className="text-xs text-slate-500">{file.type ?? "Attachment"}</div>
                                </div>
                                {file.uploaded_at && (
                                    <div className="text-xs text-slate-500">
                                        {new Date(file.uploaded_at).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        ))}
                        {attachments.length === 0 && (
                            <div className="text-slate-500 text-sm">No attachments available.</div>
                        )}
                    </div>
                </div>

                <Separator className="bg-slate-800" />

                <div className="space-y-3">
                    <div className="text-xs uppercase text-slate-500">Root Causes</div>
                    <div className="space-y-2">
                        {rootCauses.map((rc) => (
                            <div key={rc.id} className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
                                <div className="flex items-center justify-between">
                                    <div className="text-slate-200 font-semibold">{rc.method.replace("_", " ")}</div>
                                    {rc.created_at && (
                                        <div className="text-xs text-slate-500">
                                            {new Date(rc.created_at).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm text-slate-300 mt-1">{rc.description}</div>
                                {rc.contributing_factor && (
                                    <div className="text-xs text-slate-500 mt-1">Factor: {rc.contributing_factor}</div>
                                )}
                            </div>
                        ))}
                        {rootCauses.length === 0 && (
                            <div className="text-sm text-slate-500">No root causes recorded.</div>
                        )}
                    </div>
                </div>

                <Separator className="bg-slate-800" />

                {rcaSlot && (
                    <div className="space-y-3" id="rca-workspace">
                        <div className="text-xs uppercase text-slate-500">RCA Workspace</div>
                        {rcaSlot}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
