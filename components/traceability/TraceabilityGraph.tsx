"use client";

import { TraceabilityChain } from "@/lib/queries/traceability";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Factory, Beaker, Package, Microscope, AlertTriangle } from "lucide-react";

interface TraceabilityGraphProps {
    chains: TraceabilityChain[];
}

export function TraceabilityGraph({ chains }: TraceabilityGraphProps) {
    if (chains.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum vínculo de rastreabilidade encontrado.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {chains.map((chain) => {
                const finishedCount = chain.finishedLots.length;
                const intermediateCount = chain.intermediateLots.length;
                const rawCount = chain.rawMaterials.length;
                const analysisCount = chain.samples.length;
                const ncCount = chain.nonConformities.length;

                return (
                    <div key={chain.productionLot.id} className="bg-card border rounded-xl p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold">{chain.productionLot.code}</h3>
                                    <StatusBadge status={chain.productionLot.status} />
                                </div>
                                {chain.productionLot.product && (
                                    <p className="text-sm text-muted-foreground">
                                        {chain.productionLot.product.name}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <span className="px-2 py-1 rounded-full bg-muted">RM {rawCount}</span>
                                <span className="px-2 py-1 rounded-full bg-muted">PI {intermediateCount}</span>
                                <span className="px-2 py-1 rounded-full bg-muted">PF {finishedCount}</span>
                                <span className="px-2 py-1 rounded-full bg-muted">Análises {analysisCount}</span>
                                <span className="px-2 py-1 rounded-full bg-muted">NC {ncCount}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <Factory className="h-4 w-4 text-primary" />
                                <div className="flex flex-wrap gap-2">
                                    {chain.rawMaterials.map((rm) => (
                                        <Badge key={rm.id} variant="secondary" className="text-xs">
                                            {rm.raw_material?.name || "RM"} ({rm.lot_code})
                                        </Badge>
                                    ))}
                                    {chain.rawMaterials.length === 0 && (
                                        <span className="text-xs text-muted-foreground">Sem matéria-prima vinculada</span>
                                    )}
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <Link href={`/production-lots?product=${chain.productionLot.product_id}`} className="font-medium text-sm hover:underline">
                                    {chain.productionLot.code}
                                </Link>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-wrap gap-2 items-center">
                                    <Beaker className="h-4 w-4 text-primary" />
                                    {chain.intermediateLots.map((lot) => (
                                        <Link key={lot.id} href={`/intermediate-lots?lot=${lot.production_lot_id}`} className="text-sm font-medium hover:underline">
                                            {lot.code}
                                        </Link>
                                    ))}
                                    {chain.intermediateLots.length === 0 && (
                                        <span className="text-xs text-muted-foreground">Sem PI registrados</span>
                                    )}
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <div className="flex flex-wrap gap-2 items-center">
                                    <Package className="h-4 w-4 text-primary" />
                                    {chain.finishedLots.map((lot) => (
                                        <Link key={lot.id} href={`/finished-lots`} className="text-sm font-medium hover:underline">
                                            {lot.code}
                                        </Link>
                                    ))}
                                    {finishedCount === 0 && (
                                        <span className="text-xs text-muted-foreground">Sem PF liberados</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                <Microscope className="h-4 w-4 text-primary" />
                                {analysisCount > 0 ? (
                                    <span className="text-muted-foreground">{analysisCount} análises vinculadas</span>
                                ) : (
                                    <span className="text-muted-foreground">Sem análises registradas</span>
                                )}
                                <AlertTriangle className="h-4 w-4 text-amber-500 ml-4" />
                                {ncCount > 0 ? (
                                    <span className="text-muted-foreground">{ncCount} NC relacionadas</span>
                                ) : (
                                    <span className="text-muted-foreground">Sem NC ligadas</span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
