"use client"

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIntermediateLots, getIntermediateLotsByProductionLot, getProductionLots } from "@/lib/queries/production";
import { IntermediateLot, ProductionLot } from "@/types/production";
import { Plus, Beaker, Activity, Clock, Table2, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IntermediateLotsDataTable } from "@/components/production/IntermediateLotsDataTable";
import { columns } from "@/components/production/IntermediateLotsColumns";
import { IntermediateLotCard } from "@/components/production/IntermediateLotCard";
import { Badge } from "@/components/ui/badge";
import { StateChangeDialog } from "@/components/production/StateChangeDialog";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function IntermediateLotsContent() {
    const searchParams = useSearchParams();
    const lotFilter = searchParams.get('lot'); // production lot ID from URL

    const [lots, setLots] = useState<IntermediateLot[]>([]);
    const [productionLots, setProductionLots] = useState<ProductionLot[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    useEffect(() => {
        loadData();
    }, [lotFilter]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [lotsData, prodLotsData] = await Promise.all([
                lotFilter ? getIntermediateLotsByProductionLot(lotFilter) : getIntermediateLots(),
                getProductionLots()
            ]);
            setLots(lotsData);
            setProductionLots(prodLotsData);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const [selectedLot, setSelectedLot] = useState<IntermediateLot | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleChangeState = (lot: IntermediateLot) => {
        setSelectedLot(lot);
        setIsDialogOpen(true);
    };

    const handleStateChangeSuccess = () => {
        loadData();
        setSelectedLot(null);
    };

    // Calculate stats
    const stats = {
        total: lots.length,
        em_producao: lots.filter(l => l.status === 'active').length,
        terminado: lots.filter(l => l.status === 'terminado').length,
        consumido: lots.filter(l => l.status === 'consumido').length,
    };

    // Find selected production lot if filtering
    const selectedProductionLot = lotFilter
        ? productionLots.find(p => p.id === lotFilter)
        : null;

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title={selectedProductionLot
                        ? `Lotes Intermédios - ${selectedProductionLot.code}`
                        : "Intermediate Lots"}
                    description={selectedProductionLot
                        ? `Filtrando por lote de produção: ${selectedProductionLot.product?.name || selectedProductionLot.code} (${lots.length} lotes)`
                        : "Manage syrups, bases, and intermediate products"}
                    action={
                        <div className="flex gap-2">
                            <Link href="/intermediate-lots/analytics">
                                <Button variant="outline">
                                    <Activity className="w-4 h-4 mr-2" />
                                    Analytics
                                </Button>
                            </Link>
                            <Link href="/intermediate-lots/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Intermediate Lot
                                </Button>
                            </Link>
                        </div>
                    }
                />

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Batches
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Em Produção
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">{stats.em_producao}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Terminado
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500">{stats.terminado}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Consumido
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-500">{stats.consumido}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* View Toggle & Content */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Intermediate Lots Inventory</CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'table' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                            >
                                <Table2 className="h-4 w-4 mr-2" />
                                Table
                            </Button>
                            <Button
                                variant={viewMode === 'cards' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('cards')}
                            >
                                <LayoutGrid className="h-4 w-4 mr-2" />
                                Cards
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Beaker className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
                                <p>Loading inventory...</p>
                            </div>
                        ) : viewMode === 'table' ? (
                            <IntermediateLotsDataTable
                                columns={columns}
                                data={lots}
                                onChangeState={handleChangeState}
                                productionLots={productionLots.map(p => ({ id: p.id, code: p.code }))}
                            />
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {lots.map((lot) => (
                                    <IntermediateLotCard
                                        key={lot.id}
                                        lot={lot}
                                        onChangeState={handleChangeState}
                                    />
                                ))}
                            </div>
                        )}

                        {lots.length === 0 && !loading && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Beaker className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No intermediate lots yet. Click "New Intermediate Lot" to get started.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <StateChangeDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    lot={selectedLot}
                    onSuccess={handleStateChangeSuccess}
                />
            </div>
        </AppShell>
    );
}

export default function IntermediateLotsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <IntermediateLotsContent />
        </Suspense>
    );
}
