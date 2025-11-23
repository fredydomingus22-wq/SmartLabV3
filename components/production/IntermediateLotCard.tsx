"use client";

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
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
import { IntermediateLot } from "@/types/production";
import { Beaker, MoreVertical, Eye, Edit, Tag, ArrowRight, Clock, CheckCircle, Play } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, differenceInHours } from "date-fns";

interface IntermediateLotCardProps {
    lot: IntermediateLot;
    onChangeState?: (lot: IntermediateLot) => void;
}

const getStatusConfig = (status?: string) => {
    const configs: Record<string, { label: string; className: string }> = {
        em_producao: { label: "Em Produção", className: "bg-green-500/10 text-green-500 border-green-500" },
        terminado: { label: "Terminado", className: "bg-blue-500/10 text-blue-500 border-blue-500" },
        consumido: { label: "Consumido", className: "bg-gray-500/10 text-gray-500 border-gray-500" },
    };
    return configs[status || 'em_producao'] || configs.em_producao;
};

const LifecyclePanel = ({ lot }: { lot: IntermediateLot }) => {
    const calculateDuration = (start?: string, end?: string) => {
        if (!start || !end) return null;
        const hours = differenceInHours(new Date(end), new Date(start));
        return `${hours}h`;
    };

    const productionDuration = calculateDuration(lot.started_at, lot.completed_at);
    const storageDuration = calculateDuration(lot.completed_at, lot.consumed_at);

    return (
        <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xs font-semibold text-muted-foreground uppercase">Lifecycle Tracking</div>

            <div className="space-y-2">
                {/* Started */}
                <div className="flex items-center gap-2 text-xs">
                    <Play className={`h-3 w-3 ${lot.started_at ? 'text-green-500' : 'text-gray-600'}`} />
                    <span className="text-muted-foreground min-w-[80px]">Iniciado:</span>
                    {lot.started_at ? (
                        <span className="font-mono">{new Date(lot.started_at).toLocaleString()}</span>
                    ) : (
                        <span className="text-gray-600">-</span>
                    )}
                </div>

                {/* Completed */}
                <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className={`h-3 w-3 ${lot.completed_at ? 'text-blue-500' : 'text-gray-600'}`} />
                    <span className="text-muted-foreground min-w-[80px]">Terminado:</span>
                    {lot.completed_at ? (
                        <span className="font-mono">{new Date(lot.completed_at).toLocaleString()}</span>
                    ) : (
                        <span className="text-gray-600">-</span>
                    )}
                </div>

                {/* Consumed */}
                <div className="flex items-center gap-2 text-xs">
                    <Clock className={`h-3 w-3 ${lot.consumed_at ? 'text-purple-500' : 'text-gray-600'}`} />
                    <span className="text-muted-foreground min-w-[80px]">Consumido:</span>
                    {lot.consumed_at ? (
                        <span className="font-mono">{new Date(lot.consumed_at).toLocaleString()}</span>
                    ) : (
                        <span className="text-gray-600">-</span>
                    )}
                </div>
            </div>

            {/* Duration Bars */}
            {(productionDuration || storageDuration) && (
                <div className="space-y-2 pt-2 border-t border-slate-700">
                    {productionDuration && (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Tempo produção:</span>
                            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-full"></div>
                            </div>
                            <span className="font-mono text-green-500">{productionDuration}</span>
                        </div>
                    )}
                    {storageDuration && (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Tempo consumo:</span>
                            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-full"></div>
                            </div>
                            <span className="font-mono text-purple-500">{storageDuration}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export function IntermediateLotCard({ lot, onChangeState }: IntermediateLotCardProps) {
    const statusConfig = getStatusConfig(lot.status);
    const canRegisterAnalysis = lot.status === 'em_producao';

    return (
        <Card className={`bg-slate-900 border-slate-800 hover:border-primary/50 transition-all`}>
            <CardHeader className={`pb-3 border-b ${statusConfig.className.replace('bg-', 'border-').replace('/10', '/30')}`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                            <Beaker className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold font-mono">{lot.code}</h3>
                            {lot.tank && (
                                <Badge variant="outline" className="mt-1 font-mono text-xs">
                                    {lot.tank}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
                {/* Production Lot Info */}
                {lot.production_lot && (
                    <div className="flex items-center gap-2 text-sm">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <span className="font-mono text-primary">{lot.production_lot.code}</span>
                            {lot.production_lot.product && (
                                <p className="text-xs text-muted-foreground">{lot.production_lot.product.name}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Parameters */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-center">
                        <div className="text-[10px] uppercase text-muted-foreground font-bold">Brix</div>
                        <div className="font-mono text-sm mt-1">{lot.brix ?? '-'}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] uppercase text-muted-foreground font-bold">pH</div>
                        <div className="font-mono text-sm mt-1">{lot.ph ?? '-'}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-[10px] uppercase text-muted-foreground font-bold">Acidity</div>
                        <div className="font-mono text-sm mt-1">{lot.acidity ?? '-'}</div>
                    </div>
                </div>

                {/* Lifecycle Panel */}
                <LifecyclePanel lot={lot} />
            </CardContent>

            <CardFooter className="pt-4 flex gap-2">
                {canRegisterAnalysis && (
                    <Link href={`/intermediate-lots/${lot.id}/register-analysis`} className="flex-1">
                        <Button className="w-full bg-primary hover:bg-primary/90">
                            <Beaker className="mr-2 h-4 w-4" />
                            Registar Análise
                        </Button>
                    </Link>
                )}
                <Link href={`/intermediate-lots/${lot.id}`}>
                    <Button variant="outline">
                        <Eye className="h-4 w-4" />
                    </Button>
                </Link>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onChangeState?.(lot)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Change State
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Tag className="mr-2 h-4 w-4" />
                            Print Label
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardFooter>
        </Card>
    );
}
