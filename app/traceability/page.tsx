"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FlowCard } from "@/components/traceability/FlowCard";
import { RecentEvents } from "@/components/traceability/RecentEvents";
import { MonitoredProduction } from "@/components/traceability/MonitoredProduction";
import { LotDetailModal } from "@/components/traceability/LotDetailModal";
import { Search, Sparkles, Filter, Download, FileDown } from "lucide-react";
import { toast } from "sonner";
import { getTraceabilityGraph, buildProductionChains, TraceabilityChain } from "@/lib/queries/traceability";
import { TraceabilityGraph as TraceGraph } from "@/components/traceability/TraceabilityGraph";
import { usePermissions } from "@/lib/hooks/usePermissions";

export default function TraceabilityPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLot, setSelectedLot] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [chains, setChains] = useState<TraceabilityChain[]>([]);
    const [graphLoading, setGraphLoading] = useState(true);
    const { permissions, isLoading: permissionsLoading } = usePermissions();

    useEffect(() => {
        if (permissionsLoading) return;
        if (!permissions.canViewReports) {
            setGraphLoading(false);
            return;
        }

        const loadGraph = async () => {
            try {
                setGraphLoading(true);
                const graph = await getTraceabilityGraph();
                setChains(buildProductionChains(graph));
            } catch (error) {
                console.error(error);
                toast.error("Não foi possível carregar a genealogia");
            } finally {
                setGraphLoading(false);
            }
        };

        loadGraph();
    }, [permissionsLoading, permissions.canViewReports]);

    const flowStages = [
        { id: "rm", code: "RM", name: "Matéria-prima", description: "Recebimento + COA", color: "green", icon: "package", href: "/raw-materials" },
        { id: "pl", code: "PL", name: "Lote pai", description: "Preparação xarope", color: "blue", icon: "factory", href: "/production-lots" },
        { id: "pi", code: "PI", name: "Intermediário", description: "Tanques e blend", color: "amber", icon: "beaker", href: "/intermediate-lots" },
        { id: "pf", code: "PF", name: "Produto final", description: "Envase / QA", color: "purple", icon: "package", href: "/finished-lots" },
        { id: "nc", code: "NC", name: "NC / 8D", description: "Escalonamentos", color: "red", icon: "alert", href: "/nc" },
        { id: "pcc", code: "PCC", name: "PCC / PRP", description: "Controles críticos", color: "slate", icon: "shield", href: "/food-safety/pcc" }
    ];

    const recentEvents = [
        { type: "RM", code: "RM-001", description: "COA açúcar validado", time: "07:20", location: "Lab RM" },
        { type: "PL", code: "PL-240915-01", description: "Preparação tanque 03", time: "08:40", location: "Siropeira" },
        { type: "PI", code: "INT-240915-05", description: "Brix ajustado", time: "09:15", location: "PCP" },
        { type: "PF", code: "FIN-240915-09", description: "Envase PET 2", time: "10:50", location: "Produção" },
        { type: "NC", code: "NC-4826", description: "NC-4826 aberta", time: "11:05", location: "Qualidade" },
        { type: "PCC", code: "PCC-14", description: "PCC-14 inspecionado", time: "11:30", location: "Food Safety" }
    ];

    const monitoredChains = chains.map((chain) => ({
        id: chain.productionLot.id,
        lote_pai: chain.productionLot.code,
        lote_pai_id: chain.productionLot.id,
        rm: chain.rawMaterials.map((rm) => rm.lot_code).join(", ") || "-",
        rm_id: chain.rawMaterials[0]?.id || chain.productionLot.id,
        pi: chain.intermediateLots.map((pi) => pi.code).join(", ") || "-",
        pi_id: chain.intermediateLots[0]?.id || chain.productionLot.id,
        pf: chain.finishedLots.map((pf) => pf.code).join(", ") || "-",
        pf_id: chain.finishedLots[0]?.id || chain.productionLot.id,
        nc: chain.nonConformities.length ? `${chain.nonConformities.length} NC` : "-",
        pcc: "-",
    }));

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            toast.error("Digite um código de lote para buscar");
            return;
        }
        // Navigate to detail page
        router.push(`/traceability/${encodeURIComponent(searchQuery.toUpperCase())}`);
    };

    const handleExport = () => {
        toast.success("Exportando dados de rastreabilidade...");
    };

    const handleViewDetail = (id: string, type: string) => {
        const chain = chains.find((c) => c.productionLot.id === id);
        const mockLot = {
            id,
            code: chain?.productionLot.code || searchQuery || "LOT-UNKNOWN",
            type: type as "production" | "intermediate" | "finished",
            status: chain?.productionLot.status || "active",
            product: chain?.productionLot.product?.name || "N/A",
            created_at: new Date().toISOString(),
            location: chain?.productionLot.production_line || "Linha 1",
            operator: "Operador",
            genealogy: {
                parent: chain?.rawMaterials[0]?.lot_code || "RM",
                children: chain?.intermediateLots.map((pi) => pi.code) || [],
            },
        };
        setSelectedLot(mockLot);
        setIsDetailOpen(true);
    };

    return (
        <AppShell>
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            <Sparkles className="h-3.5 w-3.5" />
                            Rastreabilidade
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Linha do tempo global
                        </h1>
                        <p className="text-sm text-muted-foreground max-w-2xl">
                            Visualize <span className="font-medium text-foreground">RM → Lote Pai → PI → PF → NC → PCC</span> em um único painel de controle.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info("Filtros em desenvolvimento")}>
                            <Filter className="h-4 w-4" />
                            <span className="hidden sm:inline">Filtrar</span>
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Exportar</span>
                        </Button>
                        <Button size="sm" className="gap-2" onClick={() => router.push("/traceability/PL-240915-01")}>
                            <FileDown className="h-4 w-4" />
                            <span className="hidden sm:inline">Abrir lote em detalhe</span>
                        </Button>
                    </div>
                </div>

                <div className="bg-card border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-base font-semibold mb-1">Fluxo SmartLab</h3>
                    <p className="text-sm text-muted-foreground mb-5">Passos conectados e coloridos por domínio</p>

                    <div className="flex items-center gap-4 overflow-x-auto pb-2">
                        {flowStages.map((stage) => (
                            <FlowCard key={stage.id} stage={stage} />
                        ))}
                    </div>
                </div>

                <div className="bg-card border rounded-xl p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Buscar por código de lote (ex: PL-240915-01)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={handleSearch} className="gap-2 whitespace-nowrap">
                            <Search className="h-4 w-4" />
                            Buscar rastreabilidade
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RecentEvents events={recentEvents} />
                    <MonitoredProduction chains={monitoredChains} onViewDetail={handleViewDetail} />
                </div>

                <div className="bg-card border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-lg font-semibold">Linha do tempo consolidada</h3>
                            <p className="text-sm text-muted-foreground">RM → PL → PI → PF com status e eventos QA</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <Download className="h-4 w-4 mr-2" /> Exportar
                        </Button>
                    </div>

                    {permissionsLoading ? (
                        <div className="py-8 text-center text-muted-foreground">Validando permissões...</div>
                    ) : permissions.canViewReports ? (
                        graphLoading ? (
                            <div className="py-10 text-center text-muted-foreground">Carregando relações...</div>
                        ) : (
                            <TraceGraph chains={chains} />
                        )
                    ) : (
                        <div className="py-6 text-sm text-muted-foreground">
                            As relações inter-planta estão ocultas para este perfil.
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Lotes ativos", value: "3", color: "blue" },
                        { label: "Eventos hoje", value: "6", color: "green" },
                        { label: "NCs abertas", value: "2", color: "red" },
                        { label: "PCCs ok", value: "14/14", color: "slate" }
                    ].map((stat) => (
                        <div key={stat.label} className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <LotDetailModal
                lot={selectedLot}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
            />
        </AppShell>
    );
}
