"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IntermediateLot } from "@/types/production";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Eye, Beaker, Clock, Play, CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
        active: { label: "Active", className: "bg-green-500/10 text-green-500 border-green-500/50" },
        terminado: { label: "Terminado", className: "bg-blue-500/10 text-blue-500 border-blue-500/50" },
        consumido: { label: "Consumido", className: "bg-gray-500/10 text-gray-500 border-gray-500/50" },
    };
    const variant = variants[status] || variants.active;
    return <Badge className={variant.className}>{variant.label}</Badge>;
};

const LifecycleTimeline = ({ lot }: { lot: IntermediateLot }) => {
    const startedAt = lot.started_at || lot.prepared_at || lot.created_at;
    const completedAt = lot.completed_at || (lot.status === 'terminado' ? lot.prepared_at : undefined);
    const consumedAt = lot.consumed_at;

    const hasStarted = !!startedAt;
    const hasCompleted = !!completedAt;
    const hasConsumed = !!consumedAt;

    return (
        <div className="flex items-center gap-1 text-xs">
            <div className={`flex items-center gap-1 ${hasStarted ? 'text-green-500' : 'text-gray-600'}`}>
                <Play className="h-3 w-3" />
                {hasStarted && <span>{new Date(startedAt!).toLocaleDateString()}</span>}
            </div>
            <div className="w-8 h-0.5 bg-gray-700" />
            <div className={`flex items-center gap-1 ${hasCompleted ? 'text-blue-500' : 'text-gray-600'}`}>
                <CheckCircle className="h-3 w-3" />
                {hasCompleted && <span>{new Date(completedAt!).toLocaleDateString()}</span>}
            </div>
            <div className="w-8 h-0.5 bg-gray-700" />
            <div className={`flex items-center gap-1 ${hasConsumed ? 'text-purple-500' : 'text-gray-600'}`}>
                <Clock className="h-3 w-3" />
                {hasConsumed && <span>{new Date(consumedAt!).toLocaleDateString()}</span>}
            </div>
        </div>
    );
};

export const columns: ColumnDef<IntermediateLot>[] = [
    {
        accessorKey: "code",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Code
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => <div className="font-mono font-medium">{row.getValue("code")}</div>,
    },
    {
        accessorKey: "tank",
        header: "Tank",
        cell: ({ row }) => {
            const tank = row.original.tank;
            const label = typeof tank === 'string'
                ? tank
                : tank?.code || tank?.name || '';

            return label ? (
                <Badge variant="outline" className="font-mono">{label}</Badge>
            ) : (
                <span className="text-muted-foreground">-</span>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.getValue("status")),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        id: "production_lot",
        accessorFn: (row) => row.production_lot?.code,
        header: "Production Lot",
        cell: ({ row }) => {
            const lot = row.original.production_lot;
            return lot ? (
                <div className="flex flex-col gap-1">
                    <span className="font-mono text-sm">{lot.code}</span>
                    {lot.product && (
                        <span className="text-xs text-muted-foreground">{lot.product.name}</span>
                    )}
                </div>
            ) : (
                <span className="text-muted-foreground">-</span>
            );
        },
    },
    {
        id: "parameters",
        header: "Parameters",
        cell: ({ row }) => {
            const { brix, ph, acidity } = row.original;
            return (
                <div className="flex gap-2 text-xs">
                    <div className="flex flex-col items-center px-2 py-1 bg-slate-800 rounded">
                        <span className="text-[10px] text-muted-foreground">Brix</span>
                        <span className="font-mono">{brix ?? '-'}</span>
                    </div>
                    <div className="flex flex-col items-center px-2 py-1 bg-slate-800 rounded">
                        <span className="text-[10px] text-muted-foreground">pH</span>
                        <span className="font-mono">{ph ?? '-'}</span>
                    </div>
                    <div className="flex flex-col items-center px-2 py-1 bg-slate-800 rounded">
                        <span className="text-[10px] text-muted-foreground">Acid</span>
                        <span className="font-mono">{acidity ?? '-'}</span>
                    </div>
                </div>
            );
        },
    },
    {
        id: "lifecycle",
        header: "Lifecycle",
        cell: ({ row }) => <LifecycleTimeline lot={row.original} />,
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const lot = row.original;
            const canRegisterAnalysis = lot.status === 'active';

            return (
                <div className="flex items-center gap-2">
                    {canRegisterAnalysis && (
                        <Link href={`/intermediate-lots/${lot.id}/register-analysis`}>
                            <Button size="sm" className="bg-primary">
                                <Beaker className="mr-2 h-3 w-3" />
                                Registar Análise
                            </Button>
                        </Link>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(lot.code)}
                            >
                                Copy Code
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <Link href={`/intermediate-lots/${lot.id}`}>
                                <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                                onClick={() => {
                                    (table.options.meta as any)?.onChangeState?.(lot);
                                }}
                            >
                                Change State
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                Print Label
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
