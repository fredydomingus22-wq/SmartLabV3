/**
 * Sample History Component
 * Lists recent samples with filters for quick validation.
 */

'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SAMPLE_STATUS, type SampleStatus } from '@/lib/constants/status';

interface Sample {
    id: string;
    code: string;
    status: SampleStatus;
    collected_at?: string | null;
    created_at?: string;
    production_lot?: {
        code: string;
        product?: {
            name: string;
            sku: string;
        };
    };
    collected_by?: string;
}

interface SampleHistoryProps {
    samples: Sample[];
    onFilterChange: (filters: any) => void;
    onRefresh: () => void;
    loading: boolean;
}

export function SampleHistory({ samples, onFilterChange, onRefresh, loading }: SampleHistoryProps) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const handleSearch = (value: string) => {
        setSearch(value);
        onFilterChange({ search: value, status: statusFilter === 'all' ? undefined : statusFilter });
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        onFilterChange({ search, status: value === 'all' ? undefined : value });
    };

    const getStatusBadge = (status: SampleStatus) => {
        switch (status) {
            case SAMPLE_STATUS.PENDING:
                return <Badge variant="secondary">Pending</Badge>;
            case SAMPLE_STATUS.IN_ANALYSIS:
                return <Badge variant="default" className="bg-blue-500 text-white">In Analysis</Badge>;
            case SAMPLE_STATUS.UNDER_REVIEW:
                return <Badge variant="outline">Under Review</Badge>;
            case SAMPLE_STATUS.APPROVED:
                return <Badge variant="default" className="bg-emerald-600 text-white">Approved</Badge>;
            case SAMPLE_STATUS.REJECTED:
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-medium">Histórico Recente</CardTitle>
                <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Procurar por código..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[200px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Status</SelectItem>
                            <SelectItem value={SAMPLE_STATUS.PENDING}>Pending</SelectItem>
                            <SelectItem value={SAMPLE_STATUS.IN_ANALYSIS}>In Analysis</SelectItem>
                            <SelectItem value={SAMPLE_STATUS.UNDER_REVIEW}>Under Review</SelectItem>
                            <SelectItem value={SAMPLE_STATUS.APPROVED}>Approved</SelectItem>
                            <SelectItem value={SAMPLE_STATUS.REJECTED}>Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código da Amostra</TableHead>
                                <TableHead>Lote / Produto</TableHead>
                                <TableHead>Data Coleta</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Coletado Por</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {samples.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Nenhuma amostra encontrada
                                    </TableCell>
                                </TableRow>
                            ) : (
                                samples.map((sample) => {
                                    const timestamp = sample.collected_at || sample.created_at;
                                    return (
                                        <TableRow key={sample.id}>
                                            <TableCell className="font-medium">{sample.code}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {sample.production_lot?.code || '-'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {sample.production_lot?.product?.name || '-'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {timestamp
                                                    ? format(new Date(timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(sample.status)}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {sample.collected_by || '-'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
