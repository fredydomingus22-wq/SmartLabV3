"use client"

import { GenealogyChain } from "@/lib/queries/traceability";
import { Factory, Beaker, Package, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { Button } from "../ui/button";

interface GenealogyTimelineProps {
    genealogy: GenealogyChain;
}

export function GenealogyTimeline({ genealogy }: GenealogyTimelineProps) {
    const { production_lot, intermediate_lots, finished_lots } = genealogy;

    if (!production_lot) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>No genealogy data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded-lg border">
                    <div className="text-2xl font-bold">{intermediate_lots.length}</div>
                    <div className="text-sm text-muted-foreground">Intermediate Lots</div>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                    <div className="text-2xl font-bold">{finished_lots.length}</div>
                    <div className="text-sm text-muted-foreground">Finished Lots</div>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                    <div className="text-2xl font-bold text-primary">
                        {production_lot.product?.name || "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">Product</div>
                </div>
            </div>

            {/* Visual Timeline */}
            <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-6">Production Flow</h3>

                <div className="flex items-start gap-4 overflow-x-auto pb-4">
                    {/* Production Lot */}
                    <div className="flex flex-col items-center min-w-[200px]">
                        <div className="bg-primary/10 p-3 rounded-full mb-2">
                            <Factory className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-center">
                            <div className="font-semibold">{production_lot.code}</div>
                            <div className="text-xs text-muted-foreground">Production Lot</div>
                            <StatusBadge status={production_lot.status} className="mt-2" />
                            {production_lot.product && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    {production_lot.product.name}
                                </div>
                            )}
                        </div>
                    </div>

                    <ArrowRight className="h-6 w-6 text-muted-foreground mt-6 flex-shrink-0" />

                    {/* Intermediate Lots */}
                    <div className="flex flex-col min-w-[200px]">
                        <div className="bg-primary/10 p-3 rounded-full mb-2 mx-auto">
                            <Beaker className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-center mb-2">
                            <div className="font-semibold">Intermediate Stage</div>
                            <div className="text-xs text-muted-foreground">{intermediate_lots.length} lot(s)</div>
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {intermediate_lots.map((lot) => (
                                <div key={lot.id} className="bg-muted p-2 rounded text-sm">
                                    <Link href={`/shared/forms/intermediate_lot/${lot.id}`}>
                                        <span className="hover:underline">{lot.code}</span>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {intermediate_lots.length > 0 && (
                        <>
                            <ArrowRight className="h-6 w-6 text-muted-foreground mt-6 flex-shrink-0" />

                            {/* Finished Lots */}
                            <div className="flex flex-col min-w-[200px]">
                                <div className="bg-primary/10 p-3 rounded-full mb-2 mx-auto">
                                    <Package className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-center mb-2">
                                    <div className="font-semibold">Finished Products</div>
                                    <div className="text-xs text-muted-foreground">{finished_lots.length} lot(s)</div>
                                </div>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {finished_lots.map((lot) => (
                                        <div key={lot.id} className="bg-muted p-2 rounded text-sm space-y-1">
                                            <Link href={`/shared/forms/finished_lot/${lot.id}`}>
                                                <span className="hover:underline font-medium">{lot.code}</span>
                                            </Link>
                                            <div>
                                                <StatusBadge status={lot.status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Detailed List */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg border">
                    <h4 className="font-semibold mb-3">Intermediate Lots Details</h4>
                    <div className="space-y-2">
                        {intermediate_lots.map((lot) => (
                            <div key={lot.id} className="flex justify-between items-center p-2 bg-muted rounded">
                                <span className="font-medium">{lot.code}</span>
                                <Link href={`/intermediate-lots`}>
                                    <Button size="sm" variant="ghost">View</Button>
                                </Link>
                            </div>
                        ))}
                        {intermediate_lots.length === 0 && (
                            <p className="text-sm text-muted-foreground">No intermediate lots yet</p>
                        )}
                    </div>
                </div>

                <div className="bg-card p-4 rounded-lg border">
                    <h4 className="font-semibold mb-3">Finished Lots Details</h4>
                    <div className="space-y-2">
                        {finished_lots.map((lot) => (
                            <div key={lot.id} className="flex justify-between items-center p-2 bg-muted rounded">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{lot.code}</span>
                                    <StatusBadge status={lot.status} />
                                </div>
                                <Link href={`/finished-lots`}>
                                    <Button size="sm" variant="ghost">View</Button>
                                </Link>
                            </div>
                        ))}
                        {finished_lots.length === 0 && (
                            <p className="text-sm text-muted-foreground">No finished lots yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
