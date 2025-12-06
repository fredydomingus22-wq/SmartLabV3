"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FlowCard } from "@/components/traceability/FlowCard";
import { RecentEvents } from "@/components/traceability/RecentEvents";
import { MonitoredProduction } from "@/components/traceability/MonitoredProduction";
import { LotDetailModal } from "@/components/traceability/LotDetailModal";
import { Search, Sparkles, Filter, Download, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    getRecentTraceabilityEvents,
    getActiveProductionChains,
    getTraceabilityStats,
    RecentEvent,
    ActiveProductionChain,
    TraceabilityStats
} from "@/lib/queries/traceability";

export default function TraceabilityPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLot, setSelectedLot] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // State for database-driven data
    const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
    const [productionChains, setProductionChains] = useState<ActiveProductionChain[]>([]);
    const [stats, setStats] = useState<TraceabilityStats>({
        activeLots: 0,
        eventsToday: 0,
        openNCs: 0,
        pccsOk: '0/0'
    });

    // Navigation flow stages (acceptable as UI config)
    const flowStages = [
        { id: "rm", code: "RM", name: "Matéria-prima", description: "Recebimento + COA", color: "green", icon: "package", href: "/raw-materials" },
        { id: "pl", code: "PL", name: "Lote pai", description: "Preparação xarope", color: "blue", icon: "factory", href: "/production-lots" },
        { id: "pi", code: "PI", name: "Intermediário", description: "Tanques e blend", color: "amber", icon: "beaker", href: "/intermediate-lots" },
        { id: "pf", code: "PF", name: "Produto final", description: "Envase / QA", color: "purple", icon: "package", href: "/finished-lots" },
        { id: "nc", code: "NC", name: "NC / 8D", description: "Escalonamentos", color: "red", icon: "alert", href: "/nc" },
        { id: "pcc", code: "PCC", name: "PCC / PRP", description: "Controles críticos", color: "slate", icon: "shield", href: "/food-safety/pcc" }
    ];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [events, chains, statsData] = await Promise.all([
                getRecentTraceabilityEvents(),
                getActiveProductionChains(),
                getTraceabilityStats()
            ]);
            setRecentEvents(events);
            setProductionChains(chains);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading traceability data:', error);
            toast.error('Failed to load traceability data');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            toast.error("Digite um código de lote para buscar");
            return;
        }
        router.push(`/traceability/${encodeURIComponent(searchQuery.toUpperCase())}`);
    };

    const handleExport = () => {
        toast.success("Exportando dados de rastreabilidade...");
    };

    const handleViewDetail = (id: string, type: string) => {
        const chain = productionChains.find(c => c.lote_pai_id === id);
        if (chain) {
            const mockLot = {
                id,
                code: chain.lote_pai,
                type: type as "production" | "intermediate" | "finished",
                status: "active",
                product: "Product",
                created_at: new Date().toISOString(),
                location: "Production",
                operator: "-",
                genealogy: {
                    parent: chain.rm,
                    children: chain.pi !== '-' ? [chain.pi] : []
                }
            };
            setSelectedLot(mockLot);
            setIsDetailOpen(true);
        }
    };

    const statsDisplay = [
        { label: "Lotes ativos", value: String(stats.activeLots), color: "blue" },
        { label: "Eventos hoje", value: String(stats.eventsToday), color: "green" },
        { label: "NCs abertas", value: String(stats.openNCs), color: "red" },
        { label: "PCCs ok", value: stats.pccsOk, color: "slate" }
    ];

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
                        <Button size="sm" className="gap-2" onClick={() => loadData()}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                            <span className="hidden sm:inline">Atualizar</span>
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
                                placeholder="Buscar por código de lote..."
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

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <RecentEvents events={recentEvents} />
                            <MonitoredProduction chains={productionChains} onViewDetail={handleViewDetail} />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {statsDisplay.map((stat) => (
                                <div key={stat.label} className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <LotDetailModal
                lot={selectedLot}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
            />
        </AppShell>
    );
}
