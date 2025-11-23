'use client';

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NcrListPanel } from "@/components/ncm/NcrListPanel";
import { NcrDetailsPanel } from "@/components/ncm/NcrDetailsPanel";
import { NcrKpiPanel } from "@/components/ncm/NcrKpiPanel";
import { NcrRcaCanvas } from "@/components/ncm/NcrRcaCanvas";
import { NcrCapaPanel } from "@/components/ncm/NcrCapaPanel";
import { NcrAuditLog } from "@/components/ncm/NcrAuditLog";
import {
    listNc,
    NonConformity,
    NcSeverity,
    NcStatus,
    NcAuditLog as AuditLogType,
    NcAction,
    getNcById,
    createNc,
    updateNcStatus,
    addRootCause,
    addCapaAction,
    logAuditEvent,
    CreateNcPayload,
    CreateActionPayload,
} from "@/lib/ncService";
import { getNcRole, canPerformNcAction, NcRole } from "@/lib/ncPermissions";
import { toast } from "sonner";
import { Plus, Share2, PanelRightOpen, Wand2, Paperclip } from "lucide-react";
import { useRouter } from "next/navigation";

type FiltersState = {
    status: NcStatus[];
    severity: NcSeverity[];
    line?: string;
    search: string;
};

export default function NcmPage() {
    const router = useRouter();
    const [items, setItems] = useState<NonConformity[]>([]);
    const [selectedId, setSelectedId] = useState<string>();
    const [selectedDetail, setSelectedDetail] = useState<Awaited<ReturnType<typeof getNcById>>>();
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<FiltersState>({
        status: ["open", "in_progress"],
        severity: [],
        line: undefined,
        search: "",
    });
    const [role, setRole] = useState<NcRole | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [createPayload, setCreatePayload] = useState({
        title: "",
        description: "",
        severity: "medium" as NcSeverity,
        deviation_type: "process",
        line: "",
        due_date: "",
    });

    useEffect(() => {
        bootstrap();
    }, []);

    const bootstrap = async () => {
        const resolvedRole = await getNcRole();
        setRole(resolvedRole);
        fetchData(filters);
    };

    const fetchData = async (nextFilters: FiltersState) => {
        setLoading(true);
        try {
            const data = await listNc({
                status: nextFilters.status,
                severity: nextFilters.severity,
                line: nextFilters.line,
                search: nextFilters.search,
                limit: 50,
            });
            // Auto-escalate breached SLAs
            const breached = data.filter(
                (nc) =>
                    nc.due_date &&
                    ["open", "in_progress"].includes(nc.status) &&
                    new Date(nc.due_date) < new Date()
            );
            if (breached.length > 0) {
                await Promise.all(
                    breached.map((nc) =>
                        updateNcStatus(nc.id, "escalated").catch(() => null)
                    )
                );
                // refetch after escalations
                const refreshed = await listNc({
                    status: nextFilters.status,
                    severity: nextFilters.severity,
                    line: nextFilters.line,
                    search: nextFilters.search,
                    limit: 50,
                });
                setItems(refreshed);
                if (!selectedId && refreshed.length > 0) {
                    handleSelect(refreshed[0].id);
                }
            } else {
                setItems(data);
                if (!selectedId && data.length > 0) {
                    handleSelect(data[0].id);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load NCRs");
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (id: string) => {
        setSelectedId(id);
        try {
            const detail = await getNcById(id);
            setSelectedDetail(detail);
            // keep list in sync with latest detail status
            setItems((prev) => prev.map((nc) => (nc.id === id ? { ...nc, ...detail } : nc)));
        } catch (error) {
            console.error(error);
            toast.error("Unable to load NCR details");
        }
    };

    const handleSearch = (value: string) => {
        const updated = { ...filters, search: value };
        setFilters(updated);
        fetchData(updated);
    };

    const toggleStatus = (status: NcStatus) => {
        const exists = filters.status.includes(status);
        const nextStatus = exists ? filters.status.filter((s) => s !== status) : [...filters.status, status];
        const updated = { ...filters, status: nextStatus };
        setFilters(updated);
        fetchData(updated);
    };

    const toggleSeverity = (severity: NcSeverity) => {
        const exists = filters.severity.includes(severity);
        const nextSeverity = exists ? filters.severity.filter((s) => s !== severity) : [...filters.severity, severity];
        const updated = { ...filters, severity: nextSeverity };
        setFilters(updated);
        fetchData(updated);
    };

    const handleCreate = async () => {
        if (!canPerformNcAction(role, "create")) {
            toast.error("You do not have permission to create NCRs");
            return;
        }
        if (!createPayload.title.trim()) {
            toast.error("Title is required");
            return;
        }
        try {
            const code = `NCR-${Date.now().toString().slice(-6)}`;
            const dueDate = createPayload.due_date ? new Date(createPayload.due_date).toISOString() : undefined;
            const payload: CreateNcPayload = {
                ...createPayload,
                due_date: dueDate,
                code,
                status: "open",
            };
            await createNc(payload);
            toast.success("NCR created");
            setCreateOpen(false);
            setCreatePayload({
                title: "",
                description: "",
                severity: "medium",
                deviation_type: "process",
                line: "",
                due_date: "",
            });
            fetchData(filters);
        } catch (error) {
            console.error(error);
            toast.error("Failed to create NCR");
        }
    };

    const handleRcaSave = async (payload: { whys: { why: string; factor?: string }[]; fishbone: Record<string, string> }) => {
        if (!selectedId) return;
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
                nc_id: selectedId,
                method: "5_whys",
                description: primary.why,
            });
            await logAuditEvent({
                nc_id: selectedId,
                action: "RCA updated",
                details: { whys: payload.whys, fishbone: payload.fishbone },
            });
            toast.success("RCA saved");
            handleSelect(selectedId);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save RCA");
        }
    };

    const handleAddComment = async (comment: string) => {
        if (!selectedId) return;
        if (!canPerformNcAction(role, "comment")) {
            toast.error("No permission to comment");
            return;
        }
        try {
            await logAuditEvent({
                nc_id: selectedId,
                action: "Comment",
                details: { message: comment },
            });
            handleSelect(selectedId);
        } catch (error) {
            console.error(error);
            toast.error("Failed to add comment");
        }
    };

    const handleAddAction = async () => {
        if (!selectedId) return;
        if (!canPerformNcAction(role, "update")) {
            toast.error("No permission to add CAPA");
            return;
        }
        try {
            const capaPayload: CreateActionPayload = {
                nc_id: selectedId,
                action_type: "containment",
                title: "Isolate affected batch",
                description: "Stop line, quarantine WIP, notify QA.",
                status: "open",
            };
            await addCapaAction(capaPayload);
            await logAuditEvent({
                nc_id: selectedId,
                action: "CAPA added",
                details: { title: capaPayload.title },
            });
            toast.success("CAPA task created");
            handleSelect(selectedId);
        } catch (error) {
            console.error(error);
            toast.error("Failed to create CAPA task");
        }
    };

    const handleOpenDetailPage = () => {
        if (!selectedId) {
            toast.error("Select an NCR first");
            return;
        }
        router.push(`/ncm/${selectedId}`);
    };

    const handleOpenEightD = () => {
        if (!selectedId) {
            toast.error("Select an NCR to start 8D");
            return;
        }
        router.push(`/nc/${selectedId}/8d`);
    };

    const scrollToRca = () => {
        const el = document.getElementById("rca-workspace");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleStatusUpdate = async (status: NcStatus) => {
        if (!selectedId) return;
        if (!canPerformNcAction(role, "update")) {
            toast.error("No permission to update status");
            return;
        }
        try {
            const updated = await updateNcStatus(selectedId, status);
            await logAuditEvent({
                nc_id: selectedId,
                action: "Status change",
                details: { status },
            });
            toast.success(`Status set to ${status.replace("_", " ")}`);
            setItems((prev) => prev.map((nc) => (nc.id === selectedId ? { ...nc, status: updated.status } : nc)));
            handleSelect(selectedId);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    const selected = useMemo(() => items.find((i) => i.id === selectedId), [items, selectedId]);

    const timeline = useMemo(() => {
        if (!selected) return [];
        return [
            { label: "Opened", at: selected.created_at, type: "info" as const },
            ...(selected.updated_at ? [{ label: "Updated", at: selected.updated_at, type: "info" as const }] : []),
            ...(selected.closed_at ? [{ label: "Closed", at: selected.closed_at, type: "success" as const }] : []),
        ];
    }, [selected]);

    const attachments = useMemo(
        () =>
            selectedDetail?.attachments
                ? selectedDetail.attachments.map((file) => ({
                    name: file.file_name ?? "Evidence",
                    type: file.file_type,
                    uploaded_at: file.uploaded_at,
                }))
                : [],
        [selectedDetail]
    );

    const auditLogs: AuditLogType[] = useMemo(
        () => selectedDetail?.audit_logs ?? [],
        [selectedDetail]
    );

    const actions: NcAction[] = useMemo(
        () => selectedDetail?.actions ?? [],
        [selectedDetail]
    );

    const riskScore = useMemo(() => {
        if (!selected) return 0;
        const severityWeight: Record<NcSeverity, number> = { low: 1, medium: 2, high: 3, critical: 4 };
        const overdue = selected.due_date && new Date(selected.due_date) < new Date() ? 2 : 0;
        const escalated = selected.status === "escalated" ? 2 : 0;
        return Math.min(10, severityWeight[selected.severity] + overdue + escalated);
    }, [selected]);

    const recurrenceHotspots = useMemo(() => {
        const map = new Map<string, number>();
        items.forEach((nc) => {
            const key = `${nc.line ?? "unknown"}|${nc.deviation_type ?? "general"}`;
            map.set(key, (map.get(key) ?? 0) + 1);
        });
        return Array.from(map.entries())
            .filter(([, count]) => count > 1)
            .map(([key, count]) => {
                const [line, type] = key.split("|");
                return `${count} occurrences on line ${line} (${type})`;
            });
    }, [items]);

    const suggestedRootCauses = useMemo(() => {
        if (!selected) return [];
        const hints: string[] = [];
        if (selected.deviation_type === "process") hints.push("Check CIP/SIP parameters drift");
        if (selected.deviation_type === "product") hints.push("Verify spec limits and blend homogeneity");
        if (selected.line) hints.push(`Audit changeovers on line ${selected.line}`);
        return hints;
    }, [selected]);

    const headerBadgeTone =
        items.filter((nc) => nc.status === "escalated" || nc.status === "open").length > 0
            ? "bg-red-500/20 text-red-100 border-red-500/40"
            : "bg-emerald-500/20 text-emerald-100 border-emerald-500/40";

    return (
        <AppShell>
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <SectionHeader
                        title="Non-Conformity Command Center"
                        description="Monitor deviations, drive root cause analysis, and orchestrate CAPA execution."
                        action={
                            <div className="flex items-center gap-2">
                                <Badge className={headerBadgeTone}>
                                    {items.filter((nc) => nc.status === "escalated").length > 0 ? "Critical" : "Stable"}
                                </Badge>
                                <Button variant="outline" className="border-slate-700 text-slate-200" onClick={scrollToRca}>
                                    <Wand2 size={16} className="mr-2" />
                                    Ishikawa / 5 Whys
                                </Button>
                                <Button variant="outline" className="border-slate-700 text-slate-200" onClick={handleOpenEightD}>
                                    <Share2 size={16} className="mr-2" />
                                    8D Report
                                </Button>
                                <Button variant="outline" className="border-slate-700 text-slate-200" onClick={handleOpenDetailPage}>
                                    <PanelRightOpen size={16} className="mr-2" />
                                    Full Detail
                                </Button>
                                {canPerformNcAction(role, "create") && (
                                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="bg-emerald-600 hover:bg-emerald-500">
                                                <Plus size={16} className="mr-2" />
                                                Raise NCR
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>New Non-Conformity</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Title</Label>
                                                    <Input
                                                        value={createPayload.title}
                                                        onChange={(e) => setCreatePayload({ ...createPayload, title: e.target.value })}
                                                        placeholder="Short title"
                                                        className="bg-slate-900/70 border-slate-800 text-slate-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Description</Label>
                                                    <Input
                                                        value={createPayload.description}
                                                        onChange={(e) => setCreatePayload({ ...createPayload, description: e.target.value })}
                                                        placeholder="Describe the deviation"
                                                        className="bg-slate-900/70 border-slate-800 text-slate-100"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-2">
                                                        <Label>Severity</Label>
                                                        <Select
                                                            value={createPayload.severity}
                                                            onValueChange={(value) => setCreatePayload({ ...createPayload, severity: value as NcSeverity })}
                                                        >
                                                            <SelectTrigger className="bg-slate-900/70 border-slate-800 text-slate-100">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="low">Low</SelectItem>
                                                                <SelectItem value="medium">Medium</SelectItem>
                                                                <SelectItem value="high">High</SelectItem>
                                                                <SelectItem value="critical">Critical</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Type</Label>
                                                        <Select
                                                            value={createPayload.deviation_type}
                                                            onValueChange={(value) => setCreatePayload({ ...createPayload, deviation_type: value })}
                                                        >
                                                            <SelectTrigger className="bg-slate-900/70 border-slate-800 text-slate-100">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="process">Process</SelectItem>
                                                                <SelectItem value="product">Product</SelectItem>
                                                                <SelectItem value="equipment">Equipment</SelectItem>
                                                                <SelectItem value="audit">Audit</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-2">
                                                        <Label>Line</Label>
                                                        <Input
                                                            value={createPayload.line}
                                                            onChange={(e) => setCreatePayload({ ...createPayload, line: e.target.value })}
                                                            placeholder="Line"
                                                            className="bg-slate-900/70 border-slate-800 text-slate-100"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Due Date</Label>
                                                        <Input
                                                            type="datetime-local"
                                                            value={createPayload.due_date}
                                                            onChange={(e) => setCreatePayload({ ...createPayload, due_date: e.target.value })}
                                                            className="bg-slate-900/70 border-slate-800 text-slate-100"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end">
                                                    <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={handleCreate}>
                                                        Create NCR
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        }
                    />
                </div>

                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 xl:col-span-3 space-y-4">
                        <NcrListPanel
                            items={items}
                            selectedId={selectedId}
                            onSelect={handleSelect}
                            loading={loading}
                            filters={filters}
                            onSearch={handleSearch}
                            onToggleStatus={toggleStatus}
                            onToggleSeverity={toggleSeverity}
                        />
                    </div>

                    <div className="col-span-12 xl:col-span-6 space-y-4">
                        <NcrDetailsPanel
                            ncr={selected}
                            timeline={timeline}
                            attachments={attachments}
                            rcaSlot={<div id="rca-workspace"><NcrRcaCanvas onSave={handleRcaSave} /></div>}
                        />
                    </div>

                    <div className="col-span-12 xl:col-span-3 space-y-4">
                        <NcrKpiPanel items={items} />
                        <NcrCapaPanel actions={actions} onAddAction={handleAddAction} />
                    </div>
                </div>

                <Card className="bg-slate-900/70 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-50">Risk & Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            <Badge className="bg-red-500/20 text-red-100 border-red-500/40">
                                Risk Score {riskScore}/10
                            </Badge>
                            {recurrenceHotspots.slice(0, 2).map((hotspot) => (
                                <Badge key={hotspot} variant="outline" className="border-amber-500/40 text-amber-100">
                                    {hotspot}
                                </Badge>
                            ))}
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs uppercase text-slate-500">Suggested Root Causes</div>
                            {suggestedRootCauses.length > 0 ? (
                                <ul className="text-slate-200 text-sm list-disc pl-5 space-y-1">
                                    {suggestedRootCauses.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-slate-500 text-sm">No suggestions available.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Separator className="bg-slate-800" />

                <NcrAuditLog logs={auditLogs} onAddComment={handleAddComment} />
            </div>
        </AppShell>
    );
}
