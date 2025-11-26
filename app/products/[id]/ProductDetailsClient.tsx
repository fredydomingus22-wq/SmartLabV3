"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import {
    getProductWithSpecs,
    getProductStats,
    updateProduct
} from "@/lib/queries/products";
import {
    createProductSpec,
    updateProductSpec,
    deleteProductSpec
} from "@/lib/queries/product-specs";
import { getProductTests } from "@/lib/queries/product-tests";
import { ProductWithDetails, ProductQualitySummary, ProductSpec, CreateProductSpecData, ProductTest, ProductTestFilters } from "@/types/product";
import { ProductStats } from "../components/ProductStats";
import { SpecsTable } from "../components/SpecsTable";
import { SpecsForm } from "../components/SpecsForm";
import { TestsTable } from "../components/TestsTable";
import {
    ArrowLeft,
    Package,
    Edit,
    Power,
    Calendar,
    Boxes,
    Plus
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface ProductDetailsClientProps {
    productId: string;
}

export default function ProductDetailsClient({ productId }: ProductDetailsClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [product, setProduct] = useState<ProductWithDetails | null>(null);
    const [stats, setStats] = useState<ProductQualitySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    // Specs management
    const [showSpecsForm, setShowSpecsForm] = useState(false);
    const [editingSpec, setEditingSpec] = useState<ProductSpec | null>(null);
    const [deletingSpec, setDeletingSpec] = useState<ProductSpec | null>(null);

    // Tests
    const [tests, setTests] = useState<ProductTest[]>([]);
    const [testFilters, setTestFilters] = useState<ProductTestFilters>({});

    useEffect(() => {
        loadData();
    }, [productId]);

    useEffect(() => {
        loadTests();
    }, [productId, testFilters]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [productData, statsData] = await Promise.all([
                getProductWithSpecs(productId),
                getProductStats(productId)
            ]);
            setProduct(productData);
            setStats(statsData);
        } catch (error) {
            console.error("Error loading product:", error);
            toast({
                title: "Erro",
                description: "Erro ao carregar produto",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const loadTests = async () => {
        try {
            const testsData = await getProductTests(productId, testFilters);
            setTests(testsData);
        } catch (error) {
            console.error("Error loading tests:", error);
        }
    };

    const handleToggleActive = async () => {
        if (!product) return;

        try {
            await updateProduct(productId, { active: !product.active });
            toast({
                title: "Sucesso",
                description: product.active ? "Produto desativado" : "Produto ativado",
            });
            loadData();
        } catch (error) {
            console.error("Error toggling product:", error);
            toast({
                title: "Erro",
                description: "Erro ao alterar estado",
                variant: "destructive",
            });
        }
    };

    // Specs CRUD handlers
    const handleCreateSpec = async (data: CreateProductSpecData) => {
        try {
            await createProductSpec(data);
            toast({
                title: "Sucesso",
                description: "Especificação adicionada com sucesso!",
            });
            setShowSpecsForm(false);
            loadData();
        } catch (error) {
            console.error("Error creating spec:", error);
            // Error is already logged, SpecsForm might show it too, but we want to be safe
            throw error;
        }
    };

    const handleUpdateSpec = async (data: CreateProductSpecData) => {
        if (!editingSpec) return;

        try {
            await updateProductSpec(editingSpec.id, data);
            toast({
                title: "Sucesso",
                description: "Especificação atualizada com sucesso!",
            });
            setShowSpecsForm(false);
            setEditingSpec(null);
            loadData();
        } catch (error) {
            console.error("Error updating spec:", error);
            throw error;
        }
    };

    const handleDeleteSpec = async () => {
        if (!deletingSpec) return;

        try {
            await deleteProductSpec(deletingSpec.id);
            toast({
                title: "Sucesso",
                description: "Especificação eliminada com sucesso!",
            });
            setDeletingSpec(null);
            loadData();
        } catch (error) {
            console.error("Error deleting spec:", error);
            toast({
                title: "Erro",
                description: "Erro ao eliminar especificação",
                variant: "destructive",
            });
        }
    };

    const handleEditSpec = (spec: ProductSpec) => {
        setEditingSpec(spec);
        setShowSpecsForm(true);
    };

    const handleCancelSpecForm = () => {
        setShowSpecsForm(false);
        setEditingSpec(null);
    };

    if (loading) {
        return (
            <AppShell>
                <div className="p-6 flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </AppShell>
        );
    }

    if (!product) {
        return (
            <AppShell>
                <div className="p-6">
                    <div className="text-center py-20">
                        <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <h2 className="text-2xl font-bold mb-2">Produto não encontrado</h2>
                        <p className="text-muted-foreground mb-6">
                            O produto que procura não existe ou foi eliminado.
                        </p>
                        <Link href="/products">
                            <Button>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Voltar aos Produtos
                            </Button>
                        </Link>
                    </div>
                </div>
            </AppShell>
        );
    }

    const PRODUCT_TYPE_LABELS: Record<string, string> = {
        beverage: "Bebida",
        syrup: "Xarope",
        concentrate: "Concentrado",
        other: "Outro"
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/products">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {product.name}
                                </h1>
                                {!product.active && (
                                    <Badge variant="destructive">Inativo</Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground mt-1">
                                SKU: {product.sku}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleToggleActive}
                        >
                            <Power className="mr-2 h-4 w-4" />
                            {product.active ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Link href={`/products/${productId}/edit`}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && <ProductStats product={product} stats={stats} />}

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                        <TabsTrigger value="specs">
                            Especificações ({product.specs?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="tests">
                            Testes ({stats?.total_tests || 0})
                        </TabsTrigger>
                        <TabsTrigger value="history">Histórico</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações do Produto</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">Nome</div>
                                        <div className="font-medium">{product.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">SKU</div>
                                        <div className="font-medium font-mono">{product.sku}</div>
                                    </div>
                                    {product.product_type && (
                                        <div>
                                            <div className="text-sm text-muted-foreground mb-1">Tipo</div>
                                            <div className="font-medium">
                                                {PRODUCT_TYPE_LABELS[product.product_type]}
                                            </div>
                                        </div>
                                    )}
                                    {product.category && (
                                        <div>
                                            <div className="text-sm text-muted-foreground mb-1">Categoria</div>
                                            <div className="font-medium capitalize">{product.category}</div>
                                        </div>
                                    )}
                                    {product.shelf_life_days && (
                                        <div>
                                            <div className="text-sm text-muted-foreground mb-1">Validade</div>
                                            <div className="font-medium">{product.shelf_life_days} dias</div>
                                        </div>
                                    )}
                                    {product.storage_conditions && (
                                        <div>
                                            <div className="text-sm text-muted-foreground mb-1">Armazenamento</div>
                                            <div className="font-medium">{product.storage_conditions}</div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Criado
                                        </div>
                                        <div className="font-medium">
                                            {new Date(product.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">Estado</div>
                                        <Badge variant={product.active ? "default" : "secondary"}>
                                            {product.active ? "Ativo" : "Inativo"}
                                        </Badge>
                                    </div>
                                </div>

                                {product.description && (
                                    <div className="pt-4 border-t">
                                        <div className="text-sm text-muted-foreground mb-2">Descrição</div>
                                        <div className="text-sm">{product.description}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Links */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Link href={`/products/${productId}/specs`}>
                                <Card className="hover:border-primary transition-colors cursor-pointer">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-lg">
                                                <Boxes className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold">Gerir Especificações</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Configurar parâmetros e limites de qualidade
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href={`/production-lots?product=${productId}`}>
                                <Card className="hover:border-primary transition-colors cursor-pointer">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary/10 rounded-lg">
                                                <Package className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold">Lotes de Produção</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Ver lotes deste produto
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    </TabsContent>

                    {/* Specs Tab */}
                    <TabsContent value="specs" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Especificações</h2>
                                <p className="text-muted-foreground">
                                    Gerir parâmetros e limites de qualidade
                                </p>
                            </div>
                            <Button onClick={() => setShowSpecsForm(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Especificação
                            </Button>
                        </div>

                        <SpecsTable
                            specs={product.specs || []}
                            onEdit={handleEditSpec}
                            onDelete={setDeletingSpec}
                        />
                    </TabsContent>

                    {/* Tests Tab */}
                    <TabsContent value="tests" className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold">Testes de Qualidade</h2>
                            <p className="text-muted-foreground">
                                Histórico de todos os testes realizados neste produto
                            </p>
                        </div>

                        <TestsTable
                            tests={tests}
                            onFilterChange={setTestFilters}
                        />
                    </TabsContent>

                    {/* History Tab - Placeholder */}
                    <TabsContent value="history">
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-muted-foreground">
                                    Histórico de alterações será implementado futuramente
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Specs Form Dialog */}
                <Dialog open={showSpecsForm} onOpenChange={(open) => {
                    if (!open) handleCancelSpecForm();
                    setShowSpecsForm(open);
                }}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingSpec ? "Editar Especificação" : "Nova Especificação"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingSpec
                                    ? "Atualizar limites e configurações da especificação"
                                    : "Adicionar um novo parâmetro de qualidade para este produto"
                                }
                            </DialogDescription>
                        </DialogHeader>
                        <SpecsForm
                            productId={productId}
                            spec={editingSpec}
                            onSubmit={editingSpec ? handleUpdateSpec : handleCreateSpec}
                            onCancel={handleCancelSpecForm}
                        />
                    </DialogContent>
                </Dialog>

                {/* Delete Spec Confirmation */}
                <AlertDialog open={!!deletingSpec} onOpenChange={(open: boolean) => {
                    if (!open) setDeletingSpec(null);
                }}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar Especificação?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja eliminar a especificação para{" "}
                                <strong>{deletingSpec?.parameter?.name}</strong>?
                                Esta ação não pode ser revertida.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteSpec}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                Eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppShell>
    );
}
