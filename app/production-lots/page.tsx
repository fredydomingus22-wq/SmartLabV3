"use client"

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    getProductionLots,
    getProducts,
    updateProductionLotStatus,
    getProductionLotsStats,
    ProductionLotsStats
} from "@/lib/queries/production";
import { getProfiles, Profile } from "@/lib/queries/profiles";
import { ProductionLot, Product } from "@/types/production";
import {
    Plus,
    Factory,
    Clock,
    Package,
    TrendingUp,
    CheckCircle,
    Users,
    Search,
    X,
    Loader2
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CreateLotDialog } from "./components/CreateLotDialog";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProductionLotsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const productIdFilter = searchParams.get("product");

    const [lots, setLots] = useState<ProductionLot[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [stats, setStats] = useState<ProductionLotsStats | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Confirmation dialog state
    const [lotToClose, setLotToClose] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [lotsData, productsData, profilesData, statsData] = await Promise.all([
                getProductionLots(),
                getProducts(),
                getProfiles(),
                getProductionLotsStats()
            ]);
            setLots(lotsData);
            setProducts(productsData);
            setProfiles(profilesData);
            setStats(statsData);
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
    };

    // Filter lots
    const filteredLots = lots.filter(lot => {
        // Product filter from URL
        if (productIdFilter && lot.product_id !== productIdFilter) return false;

        // Search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                lot.code.toLowerCase().includes(query) ||
                lot.product?.name.toLowerCase().includes(query) ||
                lot.production_line?.toLowerCase().includes(query) ||
                lot.shift?.toLowerCase().includes(query)
            );
        }

        return true;
    });

    const selectedProduct = products.find(p => p.id === productIdFilter);

    const handleStatusChange = async (id: string, newStatus: ProductionLot["status"]) => {
        try {
            await updateProductionLotStatus(id, newStatus);
            toast.success(`Lote ${newStatus === 'closed' ? 'fechado' : 'atualizado'} com sucesso!`);
            loadData();
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Erro ao atualizar status do lote");
        }
    };

    const confirmCloseLot = (lotId: string) => {
        setLotToClose(lotId);
    };

    const handleCloseLot = async () => {
        if (!lotToClose) return;
        await handleStatusChange(lotToClose, "closed");
        setLotToClose(null);
    };

    if (loading) {
        return (
            <AppShell>
                <div className="p-6 flex justify-center items-center h-screen">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground">Carregando lotes de produção...</p>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                {/* Header */}
                <SectionHeader
                    title={selectedProduct ? `Lotes: ${selectedProduct.name}` : "Lotes de Produção"}
                    description={
                        selectedProduct
                            ? `Filtrado por produto (${filteredLots.length} lotes)`
                            : "Gerir lotes e corridas de produção"
                    }
                    action={
                        <div className="flex gap-2">
                            {productIdFilter && (
                                <Button variant="outline" onClick={() => router.push("/production-lots")}>
                                    <X className="mr-2 h-4 w-4" />
                                    Limpar Filtro
                                </Button>
                            )}
                            <Button onClick={() => setShowDialog(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Novo Lote
                            </Button>
                        </div>
                    }
                />

                {/* KPI Cards */}
                {stats && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        <Card className="hover:shadow-lg transition-all duration-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total de Lotes
                                </CardTitle>
                                <Factory className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_lots}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Todos os lotes criados
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-all duration-200 border-green-500/50 bg-green-500/5">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Lotes Ativos
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{stats.active_lots}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Em produção agora
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-all duration-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Concluídos Hoje
                                </CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.completed_today}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Últimas 24 horas
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-all duration-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Duração Média
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.avg_duration_hours !== null
                                        ? `${stats.avg_duration_hours}h`
                                        : "N/A"}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Tempo até fecho
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-all duration-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Produtos
                                </CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.unique_products}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Em produção
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-all duration-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Turnos Ativos
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {Object.keys(stats.lots_by_shift).length}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {Object.entries(stats.lots_by_shift)
                                        .map(([shift, count]) => `${shift.charAt(0)}: ${count}`)
                                        .join(", ") || "Nenhum"}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Search Bar */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar por código, produto, linha ou turno..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    {searchQuery && (
                        <Button variant="outline" size="icon" onClick={() => setSearchQuery("")}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Lots Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredLots.map((lot) => (
                        <div
                            key={lot.id}
                            className={`
                                group relative bg-card p-5 rounded-lg border transition-all duration-200
                                hover:shadow-lg hover:scale-[1.02] hover:border-primary/50
                                ${lot.status === 'open' ? 'border-l-4 border-l-green-500' : ''}
                            `}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`
                                    p-2.5 rounded-lg transition-all
                                    ${lot.status === 'open'
                                        ? 'bg-green-500/10 group-hover:bg-green-500/20'
                                        : 'bg-primary/10 group-hover:bg-primary/20'
                                    }
                                `}>
                                    <Factory className={`h-5 w-5 ${lot.status === 'open' ? 'text-green-500' : 'text-primary'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-lg truncate">{lot.code}</h3>
                                        <StatusBadge status={lot.status} />
                                    </div>
                                    {lot.product && (
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                                            <Package className="h-3.5 w-3.5 flex-shrink-0" />
                                            <Link
                                                href={`/products/${lot.product.id}`}
                                                className="hover:underline hover:text-primary transition-colors truncate"
                                            >
                                                {lot.product.name}
                                            </Link>
                                        </div>
                                    )}
                                    {lot.production_line && (
                                        <div className="text-xs text-muted-foreground mb-1">
                                            📍 {lot.production_line} {lot.shift && `• ${lot.shift}`}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{new Date(lot.created_at).toLocaleDateString('pt-PT')}</span>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Link href={`/intermediate-lots?lot=${lot.id}`} className="flex-1 min-w-[120px]">
                                            <Button size="sm" variant="default" className="w-full">
                                                Ver Lotes Intermédios
                                            </Button>
                                        </Link>
                                        <Link href={`/shared/forms/production_lot/${lot.id}`}>
                                            <Button size="sm" variant="outline">
                                                Formulários
                                            </Button>
                                        </Link>
                                        {lot.status === "open" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => confirmCloseLot(lot.id)}
                                                className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                                            >
                                                Fechar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredLots.length === 0 && (
                    <div className="text-center py-16 px-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                            <Factory className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            {searchQuery ? "Nenhum resultado encontrado" : "Nenhum lote de produção"}
                        </h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            {searchQuery
                                ? `Não foram encontrados lotes correspondentes a "${searchQuery}"`
                                : "Comece por criar o seu primeiro lote de produção para começar a registar a produção."
                            }
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => setShowDialog(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Criar Primeiro Lote
                            </Button>
                        )}
                    </div>
                )}

                {/* Create Dialog */}
                <CreateLotDialog
                    open={showDialog}
                    onOpenChange={setShowDialog}
                    products={products}
                    profiles={profiles}
                    onSuccess={loadData}
                    preSelectedProductId={productIdFilter}
                />

                {/* Close Confirmation Dialog */}
                <AlertDialog open={!!lotToClose} onOpenChange={() => setLotToClose(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Fechar Lote de Produção?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação irá marcar o lote como fechado. Tem a certeza que deseja continuar?
                                Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCloseLot}>
                                Fechar Lote
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppShell>
    );
}
