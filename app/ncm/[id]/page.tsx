'use client';

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NcrDetailsPanel } from "@/components/ncm/NcrDetailsPanel";
import { NcrKpiPanel } from "@/components/ncm/NcrKpiPanel";
import { NcrRcaCanvas } from "@/components/ncm/NcrRcaCanvas";
import { NcrCapaPanel } from "@/components/ncm/NcrCapaPanel";
import { NcrAuditLog } from "@/components/ncm/NcrAuditLog";
import {
    getNcById,
    NonConformity,
    NcAction,
    NcAuditLog as AuditLogType,
    addRootCause,
    addCapaAction,
    logAuditEvent,
    CreateActionPayload,
} from "@/lib/ncService";
import { getNcRole, canPerformNcAction, NcRole } from "@/lib/ncPermissions";
import { ArrowLeft, Share2, Wand2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function NcmDetailPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const [ncr, setNcr] = useState<NonConformity | null>(null);
    const [actions, setActions] = useState<NcAction[]>([]);
    const [logs, setLogs] = useState<AuditLogType[]>([]);
    const [role, setRole] = useState<NcRole | null>(null);

    useEffect(() => {
        if (params?.id) {
            bootstrap(params.id);
        }
    }, [params?.id]);

    const bootstrap = async (id: string) => {
        const resolvedRole = await getNcRole();
        setRole(resolvedRole);
        loadNcr(id);
    };

    const loadNcr = async (id: string) => {
        try {
            const data = await getNcById(id);
            setNcr(data);
            setActions(data.actions ?? []);
            setLogs(data.audit_logs ?? []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load NCR");
        }
    };

    const timeline = useMemo(() => {
        if (!ncr) return [];
        return [
            { label: "Opened", at: ncr.created_at, type: "info" as const },
            ...(ncr.updated_at ? [{ label: "Updated", at: ncr.updated_at, type: "info" as const }] : []),
            ...(ncr.closed_at ? [{ label: "Closed", at: ncr.closed_at, type: "success" as const }] : []),
        ];
    }, [ncr]);

    const handleRcaSave = async (payload: { whys: { why: string; factor?: string }[]; fishbone: Record<string, string> }) => {
        if (!params?.id) return;
        if (!canPerformNcAction(role, "update")) {
            toast.error("No permission to update RCA");
            return;
        }
        const primary = payload.whys.find((w) => w.why.trim());
        if (!primary) {
            toast.error("Add at least one root cause statement");
            return;
        }
        try {
            await addRootCause({
                nc_id: params.id,
                method: "5_whys",
                description: primary.why,
            });
            await logAuditEvent({
                nc_id: params.id,
                action: "RCA updated",
                details: { whys: payload.whys, fishbone: payload.fishbone },
            });
            toast.success("RCA saved");
            loadNcr(params.id);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save RCA");
        }
    };

    const handleAddAction = async () => {
        if (!params?.id) return;
        if (!canPerformNcAction(role, "update")) {
            toast.error("No permission to add CAPA");
            return;
        }
        try {
            const payload: CreateActionPayload = {
                nc_id: params.id,
                action_type: "corrective",
                title: "Stabilize process",
                description: "Apply interim containment and validate parameters.",
                status: "open",
            };
            await addCapaAction(payload);
            await logAuditEvent({
                nc_id: params.id,
                action: "CAPA added",
                details: { title: "Stabilize process" },
            });
            toast.success("CAPA task created");
            loadNcr(params.id);
        } catch (error) {
            console.error(error);
            toast.error("Failed to add CAPA task");
        }
    };

    const handleAddComment = async (comment: string) => {
        if (!params?.id) return;
        if (!canPerformNcAction(role, "comment")) {
            toast.error("No permission to comment");
            return;
        }
        try {
            await logAuditEvent({
                nc_id: params.id,
                action: "Comment",
                details: { message: comment },
            });
            loadNcr(params.id);
        } catch (error) {
            console.error(error);
            toast.error("Failed to add comment");
        }
    };

    const recurrenceHotspots = useMemo(() => {
        if (!ncr || !ncr.line) return [];
        return [`Monitor line ${ncr.line} for repeat deviations`];
    }, [ncr]);

    const riskScore = useMemo(() => {
        if (!ncr) return 0;
        const severityWeight: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
        return Math.min(10, (severityWeight[ncr.severity] ?? 1) + (ncr.status === "escalated" ? 2 : 0));
    }, [ncr]);

    const handleOpenEightD = () => {
        if (!params?.id) {
            toast.error("Select an NCR to start 8D");
            return;
        }
        router.push(`/nc/${params.id}/8d`);
    };

    return (
        <AppShell>
            <div className="p-6 space-y-4">
                <SectionHeader
                    title="NCR Detail"
                    description={ncr ? ncr.title : "Loading NCR..."}
                    action={
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="border-slate-700 text-slate-200" onClick={() => router.push("/ncm")}>
                                <ArrowLeft size={16} className="mr-2" />
                                Back
                            </Button>
                            <Button variant="outline" className="border-slate-700 text-slate-200" onClick={handleOpenEightD}>
                                <Share2 size={16} className="mr-2" />
                                Open 8D
                            </Button>
                            <Button variant="outline" className="border-slate-700 text-slate-200" onClick={() => {
                                const el = document.getElementById("rca-workspace");
                                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}>
                                <Wand2 size={16} className="mr-2" />
                                Ishikawa / 5 Whys
                            </Button>
                            {canPerformNcAction(role, "update") && (
                                <Button variant="secondary" className="bg-emerald-600 hover:bg-emerald-500" onClick={handleAddAction}>
                                    <Plus size={16} className="mr-2" />
                                    New CAPA
                                </Button>
                            )}
                        </div>
                    }
                />

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 xl:col-span-8 space-y-4">
                        <NcrDetailsPanel
                            ncr={ncr ?? undefined}
                            timeline={timeline}
                            attachments={
                                ncr && (ncr as any).attachments
                                    ? (ncr as any).attachments
                                    : []
                            }
                            rcaSlot={<div id="rca-workspace"><NcrRcaCanvas onSave={handleRcaSave} /></div>}
                        />
                    </div>
                    <div className="col-span-12 xl:col-span-4 space-y-4">
                        <NcrKpiPanel items={ncr ? [ncr] : []} />
                        <NcrCapaPanel actions={actions} onAddAction={handleAddAction} />
                    </div>
                </div>

                <Card className="bg-slate-900/70 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-50">Risk & Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" className="border-red-500/40 text-red-100">
                                Risk {riskScore}/10
                            </Button>
                            {recurrenceHotspots.map((item) => (
                                <Button key={item} size="sm" variant="outline" className="border-amber-500/40 text-amber-100">
                                    {item}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Separator className="bg-slate-800" />

                <NcrAuditLog logs={logs} onAddComment={handleAddComment} />
            </div>
        </AppShell>
    );
}
