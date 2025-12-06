"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Beaker, ArrowLeft, CheckCircle, XCircle, AlertCircle,
    Clock, User, Calendar, Loader2, FileText
} from "lucide-react";
import { toast } from "sonner";
import { SAMPLE_STATUS_LABELS } from "@/lib/constants/status";
import { SampleWorkflowActions } from "@/components/lab/SampleWorkflowActions";
import { getTestResultsBySample, getTestResultsSummary } from "@/lib/queries/test-results";
import type { Sample } from "@/types/lims";

interface SampleDetailsPageProps {
    params: { id: string };
}

export default function SampleDetailsPage({ params }: SampleDetailsPageProps) {
    const router = useRouter();
    const [sample, setSample] = useState<Sample | null>(null);
    const [testResults, setTestResults] = useState<any[]>([]);
    const [resultsSummary, setResultsSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activityLog, setActivityLog] = useState<any[]>([]);

    useEffect(() => {
        loadSampleData();
    }, [params.id]);

    async function loadSampleData() {
        try {
            setLoading(true);
            const supabase = createClient();

            // Fetch sample with related data
            const { data: sampleData, error: sampleError } = await supabase
                .from("samples")
                .select(`
          *,
          sample_types:sample_types(code, name),
          product:products(id, name, sku, code),
          production_lot:production_lots(id, code),
          intermediate_lot:intermediate_lots(id, code),
          tank:tanks(id, code, name),
          assigned_to_profile:profiles!samples_assigned_to_fkey(id, full_name),
          collected_by_profile:profiles!samples_collected_by_fkey(id, full_name)
        `)
                .eq("id", params.id)
                .single();

            if (sampleError) throw sampleError;
            setSample(sampleData as any);

            // Fetch test results
            const results = await getTestResultsBySample(params.id);
            setTestResults(results);

            // Fetch summary
            const summary = await getTestResultsSummary(params.id);
            setResultsSummary(summary);

            // Fetch activity log (audit trail)
            const { data: auditData } = await supabase
                .from("audit_logs")
                .select("*")
                .eq("table_name", "samples")
                .eq("record_id", params.id)
                .order("created_at", { ascending: false })
                .limit(20);

            setActivityLog(auditData || []);
        } catch (error) {
            console.error("Error loading sample:", error);
            toast.error("Erro ao carregar dados da amostra");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <AppShell>
                <div className="p-6 flex justify-center items-center h-screen">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            </AppShell>
        );
    }

    if (!sample) {
        return (
            <AppShell>
                <div className="p-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Amostra não encontrada</AlertDescription>
                    </Alert>
                    <Button onClick={() => router.back()} className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                </div>
            </AppShell>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-emerald-500/10 text-emerald-600 border-emerald-500/50";
            case "rejected":
                return "bg-red-500/10 text-red-600 border-red-500/50";
            case "under_review":
                return "bg-amber-500/10 text-amber-600 border-amber-500/50";
            case "in_analysis":
                return "bg-sky-500/10 text-sky-600 border-sky-500/50";
            default:
                return "bg-slate-500/10 text-slate-600 border-slate-500/50";
        }
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Beaker className="h-8 w-8" />
                                {sample.code}
                            </h1>
                            <p className="text-muted-foreground">
                                {(sample as any).sample_types?.name || "N/A"}
                            </p>
                        </div>
                    </div>
                    <Badge className={getStatusColor(sample.status)}>
                        {SAMPLE_STATUS_LABELS[sample.status as keyof typeof SAMPLE_STATUS_LABELS]}
                    </Badge>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                        <TabsTrigger value="results">
                            Resultados {resultsSummary && `(${resultsSummary.total})`}
                        </TabsTrigger>
                        <TabsTrigger value="activity">Histórico</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        {/* Sample Overview Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações da Amostra</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {sample.product && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Produto</p>
                                            <p className="font-medium">{(sample.product as any).name}</p>
                                        </div>
                                    )}
                                    {sample.production_lot && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Lote de Produção</p>
                                            <p className="font-medium">{(sample.production_lot as any).code}</p>
                                        </div>
                                    )}
                                    {(sample as any).tank && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Tanque</p>
                                            <p className="font-medium">{(sample as any).tank.code} - {(sample as any).tank.name}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Data de Colheita
                                        </p>
                                        <p className="font-medium">
                                            {new Date(sample.collected_at).toLocaleString("pt-PT")}
                                        </p>
                                    </div>
                                    {(sample as any).assigned_to_profile && (
                                        <div>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                Analista Atribuído
                                            </p>
                                            <p className="font-medium">{(sample as any).assigned_to_profile.full_name}</p>
                                        </div>
                                    )}
                                    {sample.observations && (
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-muted-foreground">Observações</p>
                                            <p className="font-medium">{sample.observations}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Test Results Summary */}
                        {resultsSummary && resultsSummary.total > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Resumo de Resultados</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-4">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                            <div>
                                                <p className="text-2xl font-bold">{resultsSummary.passed}</p>
                                                <p className="text-xs text-muted-foreground">Aprovados</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <XCircle className="h-5 w-5 text-red-600" />
                                            <div>
                                                <p className="text-2xl font-bold">{resultsSummary.failed}</p>
                                                <p className="text-xs text-muted-foreground">Reprovados</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-5 w-5 text-amber-600" />
                                            <div>
                                                <p className="text-2xl font-bold">{resultsSummary.pending}</p>
                                                <p className="text-xs text-muted-foreground">Pendentes</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-slate-600" />
                                            <div>
                                                <p className="text-2xl font-bold">{resultsSummary.total}</p>
                                                <p className="text-xs text-muted-foreground">Total</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Workflow Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ações</CardTitle>
                                <CardDescription>Gerir o fluxo de trabalho da amostra</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SampleWorkflowActions
                                    sampleId={sample.id}
                                    status={sample.status}
                                    userRole={'admin' as any}
                                    assignedTo={sample.assigned_to}
                                    onStatusChange={() => loadSampleData()}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="results">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resultados de Análise</CardTitle>
                                <CardDescription>Todos os parâmetros testados para esta amostra</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {testResults.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">
                                        Nenhum resultado de teste disponível
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {testResults.map((result) => (
                                            <div
                                                key={result.id}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium">{result.parameter_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {result.result_value} {result.unit}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={
                                                        result.result_status === "within_spec"
                                                            ? "default"
                                                            : result.result_status === "not_tested"
                                                                ? "secondary"
                                                                : "destructive"
                                                    }
                                                >
                                                    {result.result_status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="activity">
                        <Card>
                            <CardHeader>
                                <CardTitle>Histórico de Atividades</CardTitle>
                                <CardDescription>Linha do tempo completa da amostra</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {activityLog.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">
                                        Nenhuma  atividade registada
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {activityLog.map((log, index) => (
                                            <div key={log.id} className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                                    {index < activityLog.length - 1 && (
                                                        <div className="w-px h-full bg-border" />
                                                    )}
                                                </div>
                                                <div className="pb-4">
                                                    <p className="font-medium">{log.action}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(log.created_at).toLocaleString("pt-PT")}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppShell>
    );
}
