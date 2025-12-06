/**
 * Samples List Page - Phase 3
 * - All samples and "My Assigned" view
 * - Workflow actions (assign, start, submit review, approve/reject)
 * - Status standardised with SAMPLE_STATUS constants
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Search, Loader2, RefreshCw } from 'lucide-react';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useAuth } from '@/lib/hooks/useAuth';
import { getSamples, type SampleListItem } from '@/lib/queries/samples';
import { SAMPLE_STATUS, SAMPLE_STATUS_LABELS, type SampleStatus } from '@/lib/constants/status';
import { SampleWorkflowActions } from '@/components/lab/SampleWorkflowActions';
import { toast } from 'sonner';

type TabKey = 'all' | 'assigned';

const statusVariants: Record<SampleStatus, 'secondary' | 'outline' | 'default' | 'destructive'> = {
    [SAMPLE_STATUS.PENDING]: 'secondary',
    [SAMPLE_STATUS.IN_ANALYSIS]: 'default',
    [SAMPLE_STATUS.UNDER_REVIEW]: 'outline',
    [SAMPLE_STATUS.APPROVED]: 'default',
    [SAMPLE_STATUS.REJECTED]: 'destructive',
};

export default function SamplesListPage() {
    const { role, permissions, isLoading: permissionsLoading } = usePermissions();
    const { user, loading: authLoading } = useAuth();

    const [activeTab, setActiveTab] = useState<TabKey>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<SampleStatus | 'all'>('all');
    const [loading, setLoading] = useState(true);
    const [allSamples, setAllSamples] = useState<SampleListItem[]>([]);
    const [assignedSamples, setAssignedSamples] = useState<SampleListItem[]>([]);

    const isLoading = permissionsLoading || authLoading || loading;

    useEffect(() => {
        loadSamples();
    }, [activeTab, statusFilter, user?.id]);

    async function loadSamples() {
        setLoading(true);
        try {
            const status = statusFilter === 'all' ? undefined : statusFilter;

            const samples = await getSamples({ status });
            setAllSamples(samples);

            if (activeTab === 'assigned') {
                if (!user?.id) {
                    setAssignedSamples([]);
                    setLoading(false);
                    return;
                }
                const mySamples = await getSamples({ assignedTo: user.id, status });
                setAssignedSamples(mySamples);
            }
        } catch (error) {
            console.error('Error loading samples:', error);
            toast.error('Erro ao carregar amostras');
        } finally {
            setLoading(false);
        }
    }

    const displayedSamples = activeTab === 'assigned' ? assignedSamples : allSamples;

    const filteredSamples = useMemo(() => {
        if (!searchQuery) return displayedSamples;
        const query = searchQuery.toLowerCase();
        return displayedSamples.filter((sample) =>
            sample.code.toLowerCase().includes(query) ||
            sample.product?.name?.toLowerCase().includes(query) ||
            sample.sample_type?.name?.toLowerCase().includes(query) ||
            sample.status.toLowerCase().includes(query)
        );
    }, [displayedSamples, searchQuery]);

    const statusCounts = useMemo(() => {
        const source = allSamples;
        return {
            pending: source.filter(s => s.status === SAMPLE_STATUS.PENDING).length,
            inAnalysis: source.filter(s => s.status === SAMPLE_STATUS.IN_ANALYSIS).length,
            underReview: source.filter(s => s.status === SAMPLE_STATUS.UNDER_REVIEW).length,
            approved: source.filter(s => s.status === SAMPLE_STATUS.APPROVED).length,
        };
    }, [allSamples]);

    function updateLocalStatus(sampleId: string, nextStatus: SampleStatus) {
        const updater = (list: SampleListItem[]) =>
            list.map((sample) => sample.id === sampleId ? { ...sample, status: nextStatus } : sample);

        setAllSamples((prev) => updater(prev));
        setAssignedSamples((prev) => updater(prev));
    }

    function updateLocalAssignment(sampleId: string, analystId: string) {
        const updater = (list: SampleListItem[]) =>
            list.map((sample) => sample.id === sampleId ? { ...sample, assigned_to: analystId } : sample);

        setAllSamples((prev) => updater(prev));
        setAssignedSamples((prev) => updater(prev));
    }

    function renderStatusBadge(status: SampleStatus) {
        return <Badge variant={statusVariants[status]}>{SAMPLE_STATUS_LABELS[status]}</Badge>;
    }

    function renderTable(samples: SampleListItem[]) {
        return (
            <Card>
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Pesquisar por código, produto ou estado..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 w-64"
                            />
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => setStatusFilter(value as SampleStatus | 'all')}
                        >
                            <SelectTrigger className="w-56 bg-slate-900 border-slate-800">
                                <SelectValue placeholder="Filtrar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os estados</SelectItem>
                                {Object.values(SAMPLE_STATUS).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {SAMPLE_STATUS_LABELS[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="ghost" size="sm" onClick={loadSamples} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Produto</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Coleta</TableHead>
                                <TableHead>Técnico</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {samples.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                        {loading ? 'A carregar...' : 'Nenhuma amostra encontrada'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                samples.map((sample) => (
                                    <TableRow key={sample.id}>
                                        <TableCell>
                                            <Link href={`/lab/samples/${sample.id}`} className="hover:underline font-medium">
                                                {sample.code}
                                            </Link>
                                            {sample.product && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground">{sample.product?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{sample.product?.sku}</p>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {sample.sample_type && (
                                                <Badge variant="outline">{sample.sample_type.name}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{renderStatusBadge(sample.status)}</TableCell>
                                        <TableCell>
                                            {sample.collected_at
                                                ? new Date(sample.collected_at).toLocaleString('pt-PT')
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {sample.assigned_user?.full_name || sample.assigned_to || 'Não atribuído'}
                                        </TableCell>
                                        <TableCell>
                                            <SampleWorkflowActions
                                                sampleId={sample.id}
                                                status={sample.status}
                                                userRole={role}
                                                assignedTo={sample.assigned_to}
                                                onStatusChange={(next) => updateLocalStatus(sample.id, next)}
                                                onAssigned={(analystId) => updateLocalAssignment(sample.id, analystId)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <AppShell>
                <div className="p-6 flex justify-center items-center h-screen">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground">A carregar amostras...</p>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Amostras de Laboratório"
                    description="Gerir amostras, atribuir técnicos e controlar o ciclo de revisão"
                    action={
                        permissions.canRegisterSample && (
                            <Link href="/lab/samples/register">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nova Amostra
                                </Button>
                            </Link>
                        )
                    }
                />

                {/* Status summary */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="p-4">
                        <p className="text-sm text-muted-foreground">Pendentes</p>
                        <p className="text-2xl font-bold text-amber-500">{statusCounts.pending}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-muted-foreground">Em Análise</p>
                        <p className="text-2xl font-bold text-blue-400">{statusCounts.inAnalysis}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-muted-foreground">Em Revisão</p>
                        <p className="text-2xl font-bold text-sky-400">{statusCounts.underReview}</p>
                    </Card>
                    <Card className="p-4">
                        <p className="text-sm text-muted-foreground">Aprovadas</p>
                        <p className="text-2xl font-bold text-emerald-500">{statusCounts.approved}</p>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)}>
                    <TabsList>
                        <TabsTrigger value="all">Todas</TabsTrigger>
                        <TabsTrigger value="assigned" disabled={!user}>Minhas Atribuídas</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="mt-4">
                        {renderTable(filteredSamples)}
                    </TabsContent>
                    <TabsContent value="assigned" className="mt-4">
                        {user ? renderTable(filteredSamples) : (
                            <Card className="p-6 text-muted-foreground">
                                Inicie sessão para ver as suas amostras atribuídas.
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppShell>
    );
}
