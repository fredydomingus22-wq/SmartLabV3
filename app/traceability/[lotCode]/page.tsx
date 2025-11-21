"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuickTimeline } from "@/components/traceability/QuickTimeline";
import { TraceTree } from "@/components/traceability/TraceTree";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getLotDetail } from "@/lib/queries/traceability";

type TraceData = {
    product: string;
    line: string;
    mainLot: string;
    parentLot: string;
    status: string;
    statusColor: string;
};

type TimelineEvent = {
    type: string;
    code: string;
    description: string;
    time: string;
    color: string;
};

type TreeNode = {
    title: string;
    items: string[];
};

type RawMaterial = {
    lote: string;
    material: string;
    fornecedor: string;
    status: string;
    statusColor: string;
};

type Intermediate = {
    lote: string;
    tanque: string;
    brix: string;
    status: string;
    statusColor: string;
};

type FinishedProduct = {
    lote: string;
    linha: string;
    co2: string;
    status: string;
    statusColor: string;
};

type LabTest = {
    parameter: string;
    value: string;
    target: string;
    status: string;
    statusColor: string;
};

type NCItem = {
    code: string;
    criticality: string;
    status: string;
    statusColor: string;
};

type PCCItem = {
    name: string;
    value: string;
    status: string;
    statusColor: string;
};

export default function TraceabilityDetailPage({
    params,
}: {
    params: { lotCode: string };
}) {
    const lotCode = decodeURIComponent(params.lotCode);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [traceData, setTraceData] = useState<TraceData | null>(null);
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
    const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
    const [intermediates, setIntermediates] = useState<Intermediate[]>([]);
    const [finishedProducts, setFinishedProducts] = useState<FinishedProduct[]>([]);
    const [labTests, setLabTests] = useState<LabTest[]>([]);
    const [ncData, setNcData] = useState<NCItem[]>([]);
    const [pccData, setPccData] = useState<PCCItem[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await getLotDetail(lotCode);
                if (!result) {
                    setError("Lote não encontrado.");
                    return;
                }
                const { data, genealogy } = result;

                setTraceData({
                    product: data.product?.name ?? "Produto",
                    line: data.line ?? "Linha",
                    mainLot: genealogy.production_lot?.code ?? data.code,
                    parentLot: genealogy.production_lot?.parent_lot_code ?? "",
                    status: data.status ?? "DESCONHECIDO",
                    statusColor:
                        data.status === "LIBERADO" ? "bg-emerald-500" : "bg-red-500",
                });

                // Build timeline
                const tl: TimelineEvent[] = [];
                if (genealogy.production_lot) {
                    tl.push({
                        type: "PF",
                        code: genealogy.production_lot.code,
                        description: "Produção final",
                        time: "--:--",
                        color: "bg-purple-500",
                    });
                }
                genealogy.intermediate_lots?.forEach((int: any) => {
                    tl.push({
                        type: "PI",
                        code: int.code,
                        description: "Intermediário",
                        time: "--:--",
                        color: "bg-amber-500",
                    });
                });
                genealogy.finished_lots?.forEach((fp: any) => {
                    tl.push({
                        type: "PF",
                        code: fp.code,
                        description: "Produto final",
                        time: "--:--",
                        color: "bg-purple-500",
                    });
                });
                setTimeline(tl);

                // Tree nodes
                setTreeNodes([
                    {
                        title: "RM",
                        items:
                            genealogy.production_lot?.raw_materials?.map((rm: any) => rm.code) || [],
                    },
                    {
                        title: "LOTE PAI",
                        items: [genealogy.production_lot?.parent_lot_code].filter(Boolean) as string[],
                    },
                    {
                        title: "PI",
                        items: genealogy.intermediate_lots?.map((i: any) => i.code) || [],
                    },
                    {
                        title: "PF",
                        items: genealogy.finished_lots?.map((f: any) => f.code) || [],
                    },
                ]);

                // Tables
                setRawMaterials(genealogy.production_lot?.raw_materials || []);
                setIntermediates(genealogy.intermediate_lots || []);
                setFinishedProducts(genealogy.finished_lots || []);

                // Mock lab tests / NC / PCC (replace later with real API)
                setLabTests([
                    {
                        parameter: "Brix",
                        value: "11.9 °Bx",
                        target: "Target 11.8 ±0.2",
                        status: "OK",
                        statusColor: "bg-green-600",
                    },
                    {
                        parameter: "pH",
                        value: "3.18",
                        target: "Target 3.20 ±0.05",
                        status: "OK",
                        statusColor: "bg-green-600",
                    },
                    {
                        parameter: "CO₂",
                        value: "6.15 g/L",
                        target: "Target 6.2 ±0.2",
                        status: "A AJUSTAR",
                        statusColor: "bg-amber-600",
                    },
                ]);

                setNcData([
                    {
                        code: "NC-001",
                        criticality: "Crítica",
                        status: "EM ANÁLISE",
                        statusColor: "bg-amber-600",
                    },
                ]);

                setPccData([
                    {
                        name: "Pasteurização",
                        value: "88.4 °C",
                        status: "CONTROLADO",
                        statusColor: "bg-green-600",
                    },
                    {
                        name: "Selagem",
                        value: "OK",
                        status: "CONTROLADO",
                        statusColor: "bg-green-600",
                    },
                ]);
            } catch (e) {
                console.error(e);
                setError("Erro ao carregar os dados.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [lotCode]);

    if (loading) {
        return (
            <AppShell>
                <div className="flex items-center justify-center h-96 text-muted-foreground">
                    <svg
                        className="animate-spin h-6 w-6 mr-2 text-emerald-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                        />
                    </svg>
                    Carregando…
                </div>
            </AppShell>
        );
    }

    if (error || !traceData) {
        return (
            <AppShell>
                <div className="p-6 text-red-500">{error ?? "Dados indisponíveis."}</div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Header */}
                <div>
                    <Link href="/traceability">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mb-4 gap-2"
                            aria-label="Voltar para a timeline global"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar para Timeline Global
                        </Button>
                    </Link>

                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        RASTREABILIDADE · {lotCode}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-1">
                        {traceData.product}
                    </h1>
                    <p className="text-sm text-muted-foreground">{traceData.line}</p>
                </div>

                {/* Summary */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-card border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                                    Resumo do lote
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {traceData.mainLot} - Cadeia completa
                                </p>
                            </div>
                            <Badge
                                className={`${traceData.statusColor} text-white`}
                                aria-label={`Status: ${traceData.status}`}
                            >
                                {traceData.status}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div>
                                <div className="text-xs text-muted-foreground uppercase mb-2">
                                    LOTE PAI
                                </div>
                                <div className="text-xl font-bold">{traceData.parentLot}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground uppercase mb-2">
                                    PRODUTO FINAL PRINCIPAL
                                </div>
                                <div className="text-xl font-bold">{traceData.mainLot}</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick timeline */}
                    <QuickTimeline events={timeline} />
                </div>

                {/* Genealogy Tree */}
                <TraceTree nodes={treeNodes} />

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Raw Materials */}
                    <div className="bg-card border rounded-xl p-6">
                        <h3 className="text-base font-bold mb-1">Matérias‑primas</h3>
                        <p className="text-sm text-muted-foreground mb-4">Lotes vinculados</p>
                        <div className="space-y-3">
                            {rawMaterials.map((rm, i) => (
                                <Link key={i} href={`/raw-materials/${rm.lote}`} className="group">
                                    <div className="grid grid-cols-4 gap-2 p-3 bg-muted/30 rounded-lg text-sm hover:bg-muted/50 transition-colors">
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">LOTE</div>
                                            <div className="font-semibold">{rm.lote}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">MATERIAL</div>
                                            <div>{rm.material}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">FORNECEDOR</div>
                                            <div>{rm.fornecedor}</div>
                                        </div>
                                        <div className="flex items-end justify-end">
                                            <Badge className={`${rm.statusColor} text-white text-xs`}>{rm.status}</Badge>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Intermediates */}
                    <div className="bg-card border rounded-xl p-6">
                        <h3 className="text-base font-bold mb-1">Intermediários</h3>
                        <p className="text-sm text-muted-foreground mb-4">Tanques monitorados</p>
                        <div className="space-y-3">
                            {intermediates.map((int, i) => (
                                <Link key={i} href={`/intermediate-lots/${int.lote}`} className="group">
                                    <div className="grid grid-cols-4 gap-2 p-3 bg-muted/30 rounded-lg text-sm hover:bg-muted/50 transition-colors">
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">LOTE</div>
                                            <div className="font-semibold">{int.lote}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">TANQUE</div>
                                            <div>{int.tanque}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">BRIX</div>
                                            <div>{int.brix}</div>
                                        </div>
                                        <div className="flex items-end justify-end">
                                            <Badge className={`${int.statusColor} text-white text-xs`}>{int.status}</Badge>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Finished Products */}
                    <div className="bg-card border rounded-xl p-6">
                        <h3 className="text-base font-bold mb-1">Produto final</h3>
                        <p className="text-sm text-muted-foreground mb-4">Envases associados</p>
                        <div className="space-y-3">
                            {finishedProducts.map((fp, i) => (
                                <Link key={i} href={`/finished-lots/${fp.lote}`} className="group">
                                    <div className="grid grid-cols-4 gap-2 p-3 bg-muted/30 rounded-lg text-sm hover:bg-muted/50 transition-colors">
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">LOTE</div>
                                            <div className="font-semibold">{fp.lote}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">LINHA</div>
                                            <div>{fp.linha}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">CO₂</div>
                                            <div>{fp.co2}</div>
                                        </div>
                                        <div className="flex items-end justify-end">
                                            <Badge className={`${fp.statusColor} text-white text-xs`}>{fp.status}</Badge>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Lab Tests */}
                    <div className="bg-card border rounded-xl p-6">
                        <h3 className="text-base font-bold mb-1">Ensaios laboratoriais</h3>
                        <p className="text-sm text-muted-foreground mb-4">Últimos parâmetros</p>
                        <div className="space-y-3">
                            {labTests.map((test, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                    <div>
                                        <div className="font-semibold text-sm">{test.parameter}</div>
                                        <div className="text-xs text-muted-foreground">{test.target}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold mb-1">{test.value}</div>
                                        <Badge className={`${test.statusColor} text-white text-xs`}>{test.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* NC & 8D */}
                    <div className="bg-card border rounded-xl p-6">
                        <h3 className="text-base font-bold mb-1">NC &amp; 8D</h3>
                        <p className="text-sm text-muted-foreground mb-4">Escalonamentos vinculados</p>
                        <div className="space-y-3">
                            {ncData.map((nc, i) => (
                                <Link key={i} href={`/nc/${nc.code}`} className="group">
                                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div>
                                            <div className="font-semibold text-sm">{nc.code}</div>
                                            <div className="text-xs text-muted-foreground">{nc.criticality}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={`${nc.statusColor} text-white text-xs`}>{nc.status}</Badge>
                                            <Button size="sm" variant="ghost">Abrir →</Button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* PCCs */}
                    <div className="bg-card border rounded-xl p-6">
                        <h3 className="text-base font-bold mb-1">PCCs</h3>
                        <p className="text-sm text-muted-foreground mb-4">Pontos críticos monitorados</p>
                        <div className="space-y-3">
                            {pccData.map((pcc, i) => (
                                <Link key={i} href={`/pcc/${pcc.name}`} className="group">
                                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div>
                                            <div className="font-semibold text-sm">{pcc.name}</div>
                                            <div className="text-xs text-muted-foreground">{pcc.value}</div>
                                        </div>
                                        <Badge className={`${pcc.statusColor} text-white text-xs`}>{pcc.status}</Badge>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
