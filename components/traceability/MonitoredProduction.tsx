"use client"

import Link from "next/link";
import { ExternalLink, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductionChain {
    id: string;
    lote_pai: string;
    lote_pai_id: string;
    rm: string;
    rm_id: string | null;
    pi: string;
    pi_id: string | null;
    pf: string;
    pf_id: string | null;
    nc?: string;
    pcc?: string;
}

interface MonitoredProductionProps {
    chains: ProductionChain[];
    onViewDetail: (id: string, type: string) => void;
}

export function MonitoredProduction({ chains, onViewDetail }: MonitoredProductionProps) {
    return (
        <div className="bg-card/50 border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold">Produção monitorada</h3>
                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span className="font-semibold">{chains.length} ativos</span>
                </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Lotes pai ativos com encadeamento completo</p>

            <div className="overflow-x-auto -mx-2 px-2">
                <div className="inline-block min-w-full align-middle">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">Lote Pai</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">RM</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">PI</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">PF</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">NC</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground">PCC</th>
                                <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chains.map((chain) => (
                                <tr
                                    key={chain.id}
                                    className="border-b border-border/50 hover:bg-muted/30 transition-colors group"
                                >
                                    <td className="py-3 px-3">
                                        <button
                                            onClick={() => onViewDetail(chain.lote_pai_id, "production")}
                                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                        >
                                            {chain.lote_pai}
                                            <ExternalLink className="h-3 w-3" />
                                        </button>
                                    </td>
                                    <td className="py-3 px-3 text-sm text-muted-foreground">{chain.rm}</td>
                                    <td className="py-3 px-3 text-sm text-muted-foreground">{chain.pi}</td>
                                    <td className="py-3 px-3 text-sm text-muted-foreground">{chain.pf}</td>
                                    <td className="py-3 px-3 text-sm text-muted-foreground">{chain.nc || "-"}</td>
                                    <td className="py-3 px-3">
                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium">
                                            {chain.pcc || "-"}
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                            onClick={() => onViewDetail(chain.lote_pai_id, "production")}
                                        >
                                            Ver
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between items-center text-xs text-muted-foreground">
                <span>Exibindo {chains.length} lotes ativos</span>
                <Link href="/production-lots">
                    <Button variant="link" size="sm" className="text-xs h-auto p-0">
                        Ver todos →
                    </Button>
                </Link>
            </div>
        </div>
    );
}
