"use client";

import { useEffect, useState } from 'react';
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { getQualityKPIs, QualityKPIs } from '@/lib/queries/dashboard/getQualityKPIs';
import { getPendingApprovals, PendingApproval } from '@/lib/queries/dashboard/getPendingApprovals';
import { approveWithSignature, rejectWithSignature } from '@/lib/actions/approvals/approveWithSignature';
import { toast } from 'sonner';

export function SupervisorDashboard() {
    const [kpis, setKpis] = useState<QualityKPIs | null>(null);
    const [approvals, setApprovals] = useState<PendingApproval[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            const [kpisData, approvalsData] = await Promise.all([
                getQualityKPIs(),
                getPendingApprovals()
            ]);
            setKpis(kpisData);
            setApprovals(approvalsData);
        } catch (error: any) {
            toast.error(error.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Real KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Lotes em Produção"
                    value={kpis?.activeLotsCount.toString() || '0'}
                    icon={Clock}
                    trend={kpis && kpis.activeLotsCount > 5 ? 'up' : 'neutral'}
                    description="ativos"
                />
                <StatCard
                    title="Alertas Críticos"
                    value={kpis?.criticalAlertsCount.toString() || '0'}
                    icon={AlertTriangle}
                    trend={kpis && kpis.criticalAlertsCount > 0 ? 'down' : 'neutral'}
                    description="ativos"
                />
                <StatCard
                    title="Aprovações Pendentes"
                    value={kpis?.pendingApprovalsCount.toString() || '0'}
                    icon={CheckCircle}
                    trend="neutral"
                    description="aguardando"
                />
            </div>

            {/* Real Approvals List */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg font-medium text-slate-100">
                        Aprovações Pendentes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {approvals.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">
                            Sem aprovações pendentes
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {approvals.map((approval) => (
                                <ApprovalRow
                                    key={approval.id}
                                    approval={approval}
                                    onAction={loadDashboard}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function ApprovalRow({ approval, onAction }: { approval: PendingApproval; onAction: () => void }) {
    const [submitting, setSubmitting] = useState(false);

    const handleApprove = async () => {
        // TODO: Implement password dialog
        const password = prompt('Digite sua senha para aprovar:');
        if (!password) return;

        setSubmitting(true);
        try {
            await approveWithSignature({
                approvalId: approval.id,
                password,
                comments: 'Aprovado via dashboard'
            });
            toast.success('Aprovação registrada com sucesso');
            onAction();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao aprovar');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        const reason = prompt('Motivo da rejeição:');
        if (!reason) return;

        const password = prompt('Digite sua senha para rejeitar:');
        if (!password) return;

        setSubmitting(true);
        try {
            await rejectWithSignature({
                approvalId: approval.id,
                password,
                reason,
                comments: 'Rejeitado via dashboard'
            });
            toast.success('Rejeição registrada com sucesso');
            onAction();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao rejeitar');
        } finally {
            setSubmitting(false);
        }
    };

    const urgencyColors = {
        low: 'bg-slate-700 text-slate-300',
        medium: 'bg-blue-900/50 text-blue-300',
        high: 'bg-amber-900/50 text-amber-300',
        critical: 'bg-red-900/50 text-red-300'
    };

    return (
        <div className="flex items-center justify-between p-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-200">
                        {approval.title}
                    </p>
                    <Badge className={urgencyColors[approval.urgency]}>
                        {approval.urgency}
                    </Badge>
                </div>
                <p className="text-xs text-slate-500">
                    {approval.requestedByName} • {new Date(approval.requestedAt).toLocaleString('pt-PT')}
                </p>
                {approval.description && (
                    <p className="text-xs text-slate-400 mt-1">
                        {approval.description}
                    </p>
                )}
            </div>
            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-emerald-400 hover:text-emerald-300"
                    onClick={handleApprove}
                    disabled={submitting}
                >
                    Aprovar
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300"
                    onClick={handleReject}
                    disabled={submitting}
                >
                    Rejeitar
                </Button>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>
            <Skeleton className="h-64" />
        </div>
    );
}

