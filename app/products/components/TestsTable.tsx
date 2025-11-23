"use client"

import { useState } from "react";
import { ProductTest, ProductTestFilters } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    TestTube,
    Calendar,
    Filter,
    Download,
    CheckCircle2,
    XCircle,
    AlertCircle
} from "lucide-react";

interface TestsTableProps {
    tests: ProductTest[];
    onFilterChange?: (filters: ProductTestFilters) => void;
}

const TEST_LEVEL_LABELS: Record<string, string> = {
    incoming: "Entrada",
    in_process: "Em Processo",
    finished: "Produto Final",
    line: "Linha",
};

export function TestsTable({ tests, onFilterChange }: TestsTableProps) {
    const [filters, setFilters] = useState<ProductTestFilters>({});

    const handleFilterChange = (newFilters: Partial<ProductTestFilters>) => {
        const updated = { ...filters, ...newFilters };
        setFilters(updated);
        onFilterChange?.(updated);
    };

    const getStatusIcon = (status: string) => {
        if (status === 'in_spec') {
            return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        }
        return <XCircle className="h-4 w-4 text-red-500" />;
    };

    const getStatusColor = (status: string) => {
        return status === 'in_spec' ? 'text-green-500' : 'text-red-500';
    };

    if (tests.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Sem Testes Registados</h3>
                    <p className="text-muted-foreground">
                        Os testes realizados neste produto aparecerão aqui
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TestTube className="h-5 w-5" />
                        <span>Histórico de Testes</span>
                    </div>
                    <Badge variant="outline">{tests.length} testes</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-secondary/50 rounded-lg">
                    <div className="space-y-2">
                        <Label className="text-xs">Nível de Teste</Label>
                        <Select
                            value={filters.test_level || "all"}
                            onValueChange={(value) => handleFilterChange({
                                test_level: value === "all" ? undefined : value as any
                            })}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="incoming">Entrada</SelectItem>
                                <SelectItem value="in_process">Em Processo</SelectItem>
                                <SelectItem value="finished">Produto Final</SelectItem>
                                <SelectItem value="line">Linha</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs">Estado</Label>
                        <Select
                            value={filters.result_status || "all"}
                            onValueChange={(value) => handleFilterChange({
                                result_status: value === "all" ? undefined : value as any
                            })}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="in_spec">Aprovado</SelectItem>
                                <SelectItem value="out_of_spec">Reprovado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs">Data Inicial</Label>
                        <Input
                            type="date"
                            value={filters.date_from || ""}
                            onChange={(e) => handleFilterChange({ date_from: e.target.value })}
                            className="h-9"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs">Data Final</Label>
                        <Input
                            type="date"
                            value={filters.date_to || ""}
                            onChange={(e) => handleFilterChange({ date_to: e.target.value })}
                            className="h-9"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data/Hora</TableHead>
                                <TableHead>Parâmetro</TableHead>
                                <TableHead className="text-center">Valor Medido</TableHead>
                                <TableHead className="text-center">Especificação</TableHead>
                                <TableHead>Nível</TableHead>
                                <TableHead className="text-center">Estado</TableHead>
                                <TableHead>Testado Por</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tests.map((test) => (
                                <TableRow key={test.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                            <div>
                                                <div className="text-sm">
                                                    {new Date(test.tested_at).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(test.tested_at).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {test.parameter?.name || "Desconhecido"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`font-mono font-bold ${getStatusColor(test.result_status)}`}>
                                            {test.measured_value}
                                        </span>
                                        {test.unit && (
                                            <span className="text-xs text-muted-foreground ml-1">
                                                {test.unit}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="text-xs font-mono space-y-1">
                                            {test.spec_min !== null && test.spec_max !== null ? (
                                                <>
                                                    <div className="text-muted-foreground">
                                                        {test.spec_min} - {test.spec_max}
                                                    </div>
                                                    {test.spec_target !== null && (
                                                        <div className="text-primary">
                                                            Alvo: {test.spec_target}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs">
                                            {TEST_LEVEL_LABELS[test.test_level] || test.test_level}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {getStatusIcon(test.result_status)}
                                            <span className={`text-xs font-medium ${getStatusColor(test.result_status)}`}>
                                                {test.result_status === 'in_spec' ? 'Aprovado' : 'Reprovado'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {test.tested_by || "-"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Summary */}
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                    <div>
                        Mostrando {tests.length} teste{tests.length !== 1 ? 's' : ''}
                    </div>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
