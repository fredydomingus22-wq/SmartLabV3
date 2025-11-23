"use client"

import { ProductSpec } from "@/types/product";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreVertical,
    Edit,
    Trash2,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SpecsTableProps {
    specs: ProductSpec[];
    onEdit?: (spec: ProductSpec) => void;
    onDelete?: (spec: ProductSpec) => void;
}

const TEST_LEVEL_LABELS: Record<string, string> = {
    incoming: "Entrada",
    in_process: "Em Processo",
    finished: "Produto Final",
    line: "Linha",
};

const TEST_FREQUENCY_LABELS: Record<string, string> = {
    per_batch: "Por Lote",
    daily: "Diário",
    weekly: "Semanal",
    per_tank: "Por Tanque",
    per_sample: "Por Amostra",
};

export function SpecsTable({ specs, onEdit, onDelete }: SpecsTableProps) {
    if (specs.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Sem Especificações</h3>
                    <p className="text-muted-foreground">
                        Adicione especificações para definir os parâmetros de qualidade deste produto
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Especificações de Qualidade</span>
                    <Badge variant="outline">{specs.length} parâmetros</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Parâmetro</TableHead>
                                <TableHead className="text-center">Min</TableHead>
                                <TableHead className="text-center">Alvo</TableHead>
                                <TableHead className="text-center">Máx</TableHead>
                                <TableHead>Unidade</TableHead>
                                <TableHead>Nível de Teste</TableHead>
                                <TableHead>Frequência</TableHead>
                                <TableHead className="text-center">Crítico</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {specs.map((spec) => (
                                <TableRow key={spec.id}>
                                    <TableCell className="font-medium">
                                        <div>
                                            <div>{spec.parameter?.name || "Parâmetro Desconhecido"}</div>
                                            {spec.parameter?.description && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {spec.parameter.description}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-mono">
                                        {spec.spec_min ?? "-"}
                                    </TableCell>
                                    <TableCell className="text-center font-mono font-bold text-primary">
                                        {spec.spec_target ?? "-"}
                                    </TableCell>
                                    <TableCell className="text-center font-mono">
                                        {spec.spec_max ?? "-"}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {spec.unit || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {spec.test_level ? (
                                            <Badge variant="outline" className="text-xs">
                                                {TEST_LEVEL_LABELS[spec.test_level] || spec.test_level}
                                            </Badge>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {spec.test_frequency ? (
                                            <span className="text-xs text-muted-foreground">
                                                {TEST_FREQUENCY_LABELS[spec.test_frequency] || spec.test_frequency}
                                            </span>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {spec.is_critical ? (
                                            <Badge variant="destructive" className="text-xs">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                Sim
                                            </Badge>
                                        ) : (
                                            <CheckCircle2 className="h-4 w-4 mx-auto text-muted-foreground" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {onEdit && (
                                                    <DropdownMenuItem onClick={() => onEdit(spec)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                )}
                                                {onDelete && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => onDelete(spec)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {specs.some(s => s.notes) && (
                    <div className="mt-4 text-xs text-muted-foreground">
                        <strong>Notas:</strong> Alguns parâmetros têm notas adicionais
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
