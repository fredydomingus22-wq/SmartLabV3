"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    createFoodSafetyItem,
    listFoodSafetyItems,
    logMonitoringEvent,
    closeFoodSafetyItem,
    updateFoodSafetyItem,
} from "@/lib/queries/foodSafety";
import { FoodSafetyRecord, FoodSafetyStatus, FoodSafetyType } from "@/types/foodSafety";
import { toast } from "sonner";
import { Activity, AlertTriangle, CheckCircle2, Clock3, Plus, ShieldCheck } from "lucide-react";
import { useCurrentRole } from "@/lib/auth/role";

interface FoodSafetyBoardProps {
    type: FoodSafetyType;
    title: string;
    description: string;
}

const statusColor: Record<FoodSafetyStatus, string> = {
    open: "bg-slate-700 text-white",
    monitoring: "bg-sky-700 text-white",
    breach: "bg-red-700 text-white",
    closed: "bg-emerald-700 text-white",
};

const typeCopy: Record<FoodSafetyType, { icon: ReactNode; accent: string }> = {
    prp: { icon: <ShieldCheck className="w-4 h-4" />, accent: "from-emerald-500/10 to-teal-500/10" },
    oprp: { icon: <Activity className="w-4 h-4" />, accent: "from-yellow-500/10 to-orange-500/10" },
    pcc: { icon: <AlertTriangle className="w-4 h-4" />, accent: "from-red-500/10 to-rose-500/10" },
};

export function FoodSafetyBoard({ type, title, description }: FoodSafetyBoardProps) {
    const [records, setRecords] = useState<FoodSafetyRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [monitoringTarget, setMonitoringTarget] = useState<FoodSafetyRecord | null>(null);
    const [closeTarget, setCloseTarget] = useState<FoodSafetyRecord | null>(null);
    const [form, setForm] = useState({
        title: "",
        hazard: "",
        critical_limit: "",
        monitoring_frequency: "",
        evidence: "",
        immediate_actions: "",
        responsible: "",
        due_date: "",
    });
    const [monitoring, setMonitoring] = useState({
        evidence: "",
        immediate_actions: "",
        status: "monitoring" as FoodSafetyStatus,
    });
    const [closeForm, setCloseForm] = useState({
        comment: "",
        password: "",
    });

    const role = useCurrentRole();

    useEffect(() => {
        fetchRecords();
    }, [type]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const data = await listFoodSafetyItems(type);
            setRecords(data);
        } catch (error) {
            console.error(error);
            toast.error("Falha ao carregar registros de segurança alimentar");
        } finally {
            setLoading(false);
        }
    };

    const breaches = useMemo(() => records.filter((record) => record.status === "breach"), [records]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createFoodSafetyItem(type, {
                ...form,
                status: "open",
            });
            toast.success("Registro criado com sucesso");
            setCreateOpen(false);
            setForm({
                title: "",
                hazard: "",
                critical_limit: "",
                monitoring_frequency: "",
                evidence: "",
                immediate_actions: "",
                responsible: "",
                due_date: "",
            });
            fetchRecords();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || "Não foi possível criar o registro");
        }
    };

    const handleMonitoring = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!monitoringTarget) return;
        if (monitoring.status === "breach" && (!role || !["manager", "supervisor", "admin"].includes(role))) {
            toast.error("Apenas supervisores ou gestão podem marcar desvio crítico");
            return;
        }
        try {
            await logMonitoringEvent(
                type,
                monitoringTarget.id,
                monitoring.evidence,
                monitoring.immediate_actions,
                monitoring.status,
            );
            toast.success("Monitoramento registado");
            setMonitoringTarget(null);
            setMonitoring({ evidence: "", immediate_actions: "", status: "monitoring" });
            fetchRecords();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || "Não foi possível registar o monitoramento");
        }
    };

    const handleClose = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!closeTarget) return;
        if (!role || !["manager", "supervisor", "admin"].includes(role)) {
            toast.error("Apenas supervisores ou gestão podem encerrar");
            return;
        }
        try {
            await closeFoodSafetyItem(type, closeTarget.id, closeForm.comment, closeForm.password);
            toast.success("Item encerrado e assinado");
            setCloseTarget(null);
            setCloseForm({ comment: "", password: "" });
            fetchRecords();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || "Não foi possível encerrar o item");
        }
    };

    const markBreach = async (record: FoodSafetyRecord) => {
        if (!role || !["manager", "supervisor", "admin"].includes(role)) {
            toast.error("Apenas supervisores ou gestão podem sinalizar desvios críticos");
            return;
        }
        try {
            await updateFoodSafetyItem(type, record.id, { status: "breach" });
            toast.success("Ponto marcado como desvio crítico");
            fetchRecords();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || "Não foi possível atualizar o status");
        }
    };

    const renderStatusBadge = (status: FoodSafetyStatus) => (
        <Badge className={statusColor[status]}>{status}</Badge>
    );

    return (
        <AppShell>
            <div className="space-y-6 p-6">
                <SectionHeader title={title} description={description} action={null} />

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-slate-900/60 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                {typeCopy[type].icon} Total Registros
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-white">{records.length}</p>
                            <p className="text-xs text-slate-400">Controle ativo e histórico</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br border-slate-800 from-slate-900/60 to-slate-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Clock3 className="w-4 h-4" /> Em monitoramento
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-amber-400">
                                {records.filter((r) => r.status === "monitoring").length}
                            </p>
                            <p className="text-xs text-slate-400">Acompanhar evidências e ações</p>
                        </CardContent>
                    </Card>
                    <Card className={`bg-gradient-to-br border-slate-800 ${typeCopy[type].accent}`}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Desvios críticos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-red-400">{breaches.length}</p>
                            <p className="text-xs text-slate-400">PCC/PPRO com limites violados</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-slate-900/60 border-slate-800">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-lg">Registos e monitoramento</CardTitle>
                            <p className="text-sm text-muted-foreground">Limites críticos, evidências e ações imediatas</p>
                        </div>
                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" /> Novo registo
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>Novo {type.toUpperCase()}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Título</Label>
                                            <Input
                                                id="title"
                                                value={form.title}
                                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="hazard">Perigo / processo</Label>
                                            <Input
                                                id="hazard"
                                                value={form.hazard}
                                                onChange={(e) => setForm({ ...form, hazard: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="critical_limit">Limite crítico</Label>
                                            <Input
                                                id="critical_limit"
                                                value={form.critical_limit}
                                                onChange={(e) => setForm({ ...form, critical_limit: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="monitoring_frequency">Frequência de monitoramento</Label>
                                            <Input
                                                id="monitoring_frequency"
                                                value={form.monitoring_frequency}
                                                onChange={(e) => setForm({ ...form, monitoring_frequency: e.target.value })}
                                                placeholder="Ex: a cada hora, por turno"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="responsible">Responsável</Label>
                                            <Input
                                                id="responsible"
                                                value={form.responsible}
                                                onChange={(e) => setForm({ ...form, responsible: e.target.value })}
                                                placeholder="Técnico ou supervisor"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="due_date">Vencimento / revisão</Label>
                                            <Input
                                                id="due_date"
                                                type="date"
                                                value={form.due_date}
                                                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="evidence">Evidências</Label>
                                            <Textarea
                                                id="evidence"
                                                value={form.evidence}
                                                onChange={(e) => setForm({ ...form, evidence: e.target.value })}
                                                placeholder="Checklist, fotos ou medições"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="immediate_actions">Ações imediatas</Label>
                                            <Textarea
                                                id="immediate_actions"
                                                value={form.immediate_actions}
                                                onChange={(e) => setForm({ ...form, immediate_actions: e.target.value })}
                                                placeholder="Contenção, segregação, ajuste de processo"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit">Guardar</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Limite crítico</TableHead>
                                        <TableHead>Responsável</TableHead>
                                        <TableHead>Último check</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {records.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                Nenhum registo criado.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {records.map((record) => (
                                        <TableRow key={record.id} className="hover:bg-slate-800/30">
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="font-medium text-white">{record.title}</p>
                                                    <p className="text-xs text-muted-foreground">{record.hazard}</p>
                                                    <div className="flex gap-2 flex-wrap text-xs text-slate-300">
                                                        <span>Monitoramento: {record.monitoring_frequency}</span>
                                                        {record.due_date && <span>Revisão: {record.due_date}</span>}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-200">{record.critical_limit}</TableCell>
                                            <TableCell className="text-sm text-slate-200">{record.responsible || "-"}</TableCell>
                                            <TableCell className="text-xs text-slate-400">
                                                {record.last_check
                                                    ? new Date(record.last_check).toLocaleString()
                                                    : "Sem evidência"}
                                            </TableCell>
                                            <TableCell>{renderStatusBadge(record.status)}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Dialog open={monitoringTarget?.id === record.id} onOpenChange={(open) => {
                                                    setMonitoringTarget(open ? record : null);
                                                    setMonitoring({ evidence: record.evidence || "", immediate_actions: record.immediate_actions || "", status: record.status });
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">Evidência</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Atualizar evidências</DialogTitle>
                                                        </DialogHeader>
                                                        <form onSubmit={handleMonitoring} className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label>Evidências de monitoramento</Label>
                                                                <Textarea
                                                                    value={monitoring.evidence}
                                                                    onChange={(e) => setMonitoring({ ...monitoring, evidence: e.target.value })}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Ações imediatas</Label>
                                                                <Textarea
                                                                    value={monitoring.immediate_actions}
                                                                    onChange={(e) => setMonitoring({ ...monitoring, immediate_actions: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Status</Label>
                                                                <Select
                                                                    value={monitoring.status}
                                                                    onValueChange={(value: FoodSafetyStatus) =>
                                                                        setMonitoring({ ...monitoring, status: value })
                                                                    }
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="monitoring">Em monitoramento</SelectItem>
                                                                        <SelectItem value="breach">Desvio crítico</SelectItem>
                                                                        <SelectItem value="open">Aberto</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="flex justify-end gap-2">
                                                                <Button type="button" variant="outline" onClick={() => setMonitoringTarget(null)}>
                                                                    Cancelar
                                                                </Button>
                                                                <Button type="submit">Guardar</Button>
                                                            </div>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                                <Dialog open={closeTarget?.id === record.id} onOpenChange={(open) => {
                                                    setCloseTarget(open ? record : null);
                                                    setCloseForm({ comment: "", password: "" });
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="secondary" size="sm">
                                                            <CheckCircle2 className="w-4 h-4 mr-1" /> Encerrar
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Encerrar e aprovar</DialogTitle>
                                                        </DialogHeader>
                                                        <form onSubmit={handleClose} className="space-y-4">
                                                            <div className="space-y-2">
                                                                <Label>Comentário / evidência final</Label>
                                                                <Textarea
                                                                    value={closeForm.comment}
                                                                    onChange={(e) => setCloseForm({ ...closeForm, comment: e.target.value })}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Senha para assinatura</Label>
                                                                <Input
                                                                    type="password"
                                                                    value={closeForm.password}
                                                                    onChange={(e) => setCloseForm({ ...closeForm, password: e.target.value })}
                                                                    required
                                                                />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                A assinatura eletrônica será registada e vinculada ao log de auditoria.
                                                            </p>
                                                            <div className="flex justify-end gap-2">
                                                                <Button type="button" variant="outline" onClick={() => setCloseTarget(null)}>
                                                                    Cancelar
                                                                </Button>
                                                                <Button type="submit">Assinar e encerrar</Button>
                                                            </div>
                                                        </form>
                                                    </DialogContent>
                                                </Dialog>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-400 hover:text-red-300"
                                                    onClick={() => markBreach(record)}
                                                >
                                                    Marcar desvio
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
