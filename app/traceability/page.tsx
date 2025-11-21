"use client"

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FlowCard } from "@/components/traceability/FlowCard";
import { RecentEvents } from "@/components/traceability/RecentEvents";
import { MonitoredProduction } from "@/components/traceability/MonitoredProduction";
import { LotDetailModal } from "@/components/traceability/LotDetailModal";
import { Search, Sparkles, Filter, Download, FileDown } from "lucide-react";
import { toast } from "sonner";

export default function TraceabilityPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLot, setSelectedLot] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

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

    const productionChains = [
        {
            id: "1",
            lote_pai: "PL-240915-01",
            lote_pai_id: "uuid-pl-01",
            rm: "RM-ACUC-4412",
            rm_id: "uuid-rm-01",
            pi: "INT-240915-05",
            pi_id: "uuid-pi-01",
            pf: "PF-240915-09",
            pf_id: "uuid-pf-01",
            nc: "-",
            pcc: "PCC 12"
        },
        {
            id: "2",
            lote_pai: "PL-240915-04",
            lote_pai_id: "uuid-pl-02",
            rm: "RM-AROMA-217",
            rm_id: "uuid-rm-02",
            pi: "INT-240915-08",
            pi_id: "uuid-pi-02",
            pf: "PF-240915-12",
            pf_id: "uuid-pf-02",
            nc: "NC-4810",
            pcc: "07"
        },
        {
            id: "3",
            lote_pai: "PL-240915-11",
            lote_pai_id: "uuid-pl-03",
            rm: "RM-CHÁ-198",
            rm_id: "uuid-rm-03",
            pi: "INT-240915-15",
            pi_id: "uuid-pi-03",
            pf: "PF-240915-21",
            pf_id: "uuid-pf-03",
            nc: "NC-4826",
            pcc: "PCC 14"
        }
    ];

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            toast.error("Digite um código de lote para buscar");
            return;
        }
        toast.success(`Buscando por: ${searchQuery}`);
        // TODO: Implement actual search logic
    };

    const handleExport = () => {
        toast.success("Exportando dados de rastreabilidade...");
        // TODO: Implement export functionality
    };

    const handleViewDetail = (id: string, type: string) => {
        // Mock data for demonstration
        const mockLot = {
            id,
            code: productionChains.find(c => c.lote_pai_id === id)?.lote_pai || "LOT-UNKNOWN",
            type: type as "production" | "intermediate" | "finished",
            status: "active",
            product: "Cola 2L PET",
            created_at: new Date().toISOString(),
            location: "Linha 1",
            operator: "João Silva",
            genealogy: {
                parent: "RM-ACUC-4412",
                children: ["INT-240915-05", "INT-240915-06"]
            }
        };
        setSelectedLot(mockLot);
        setIsDetailOpen(true);
    };

    return (
        <AppShell>
            {/* Fixed max-width container for proper responsiveness */}
            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

                {/* Ultra-premium header */}
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
                        <Button size="sm" className="gap-2" onClick={() => handleViewDetail(productionChains[0].lote_pai_id, "production")}>
                            <FileDown className="h-4 w-4" />
                            <span className="hidden sm:inline">Abrir lote em detalhe</span>
                        </Button>
                    </div>
                </div>

                {/* Flow Timeline - Ultra clean */}
                <div className="bg-card border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-base font-semibold mb-1">Fluxo SmartLab</h3>
                    <p className="text-sm text-muted-foreground mb-5">Passos conectados e coloridos por domínio</p>

                    <div className="flex items-center gap-4 overflow-x-auto pb-2">
                        {flowStages.map((stage) => (
                            <FlowCard key={stage.id} stage={stage} />
                        ))}
                    </div>
                </div>

                {/* Search - Clean and functional */}
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

                {/* Two column layout - Proper spacing */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RecentEvents events={recentEvents} />
                    <MonitoredProduction chains={productionChains} onViewDetail={handleViewDetail} />
                </div>

                {/* Stats - Clean grid */}
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

            {/* Detail Modal */}
            <LotDetailModal
                lot={selectedLot}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
            />
        </AppShell>
    );
}
