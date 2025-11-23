"use client"

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    getProducts,
    getAllProductsWithStats,
    createProduct,
    updateProduct,
    toggleProductActive,
    deleteProduct
} from "@/lib/queries/products";
import { Product, ProductQualitySummary, CreateProductData, ProductFilters } from "@/types/product";
import { ProductCard } from "./components/ProductCard";
import { ProductForm } from "./components/ProductForm";
import {
    Plus,
    Search,
    Filter,
    Package,
    LayoutGrid,
    LayoutList,
    Download,
    RefreshCw
} from "lucide-react";
import { toast } from "sonner";
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

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [productsStats, setProductsStats] = useState<Map<string, ProductQualitySummary>>(new Map());
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filters
    const [filters, setFilters] = useState<ProductFilters>({
        active: true,
        search: ""
    });

    // Form dialog
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Delete confirmation
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [productsData, statsData] = await Promise.all([
                getProducts(filters),
                getAllProductsWithStats()
            ]);

            setProducts(productsData);

            // Create map of stats
            const statsMap = new Map<string, ProductQualitySummary>();
            statsData.forEach(stat => {
                statsMap.set(stat.product_id, stat);
            });
            setProductsStats(statsMap);
        } catch (error) {
            console.error("Error loading products:", error);
            toast.error("Erro ao carregar produtos");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async (data: CreateProductData) => {
        try {
            await createProduct(data);
            toast.success("Produto criado com sucesso!");
            setShowForm(false);
            loadData();
        } catch (error) {
            console.error("Error creating product:", error);
            throw error;
        }
    };

    const handleUpdateProduct = async (data: CreateProductData) => {
        if (!editingProduct) return;

        try {
            await updateProduct(editingProduct.id, data);
            toast.success("Produto atualizado com sucesso!");
            setShowForm(false);
            setEditingProduct(null);
            loadData();
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    };

    const handleToggleActive = async (product: Product) => {
        try {
            await toggleProductActive(product.id);
            toast.success(
                product.active ? "Produto desativado" : "Produto ativado"
            );
            loadData();
        } catch (error) {
            console.error("Error toggling product:", error);
            toast.error("Erro ao alterar estado do produto");
        }
    };

    const handleDeleteProduct = async () => {
        if (!deletingProduct) return;

        try {
            await deleteProduct(deletingProduct.id);
            toast.success("Produto eliminado com sucesso!");
            setDeletingProduct(null);
            loadData();
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Erro ao eliminar produto");
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    const filteredProductsCount = products.length;
    const activeCount = products.filter(p => p.active).length;
    const inactiveCount = filteredProductsCount - activeCount;

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                {/* Header */}
                <SectionHeader
                    title="Produtos"
                    description="Gerir produtos, especificações e testes de qualidade"
                    action={
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => loadData()}
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button onClick={() => setShowForm(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Novo Produto
                            </Button>
                        </div>
                    }
                />

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar por nome ou SKU..."
                            value={filters.search || ""}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="pl-9"
                        />
                    </div>

                    {/* Active Filter */}
                    <Select
                        value={filters.active === undefined ? "all" : filters.active ? "active" : "inactive"}
                        onValueChange={(value) => setFilters({
                            ...filters,
                            active: value === "all" ? undefined : value === "active"
                        })}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos ({filteredProductsCount})</SelectItem>
                            <SelectItem value="active">Ativos ({activeCount})</SelectItem>
                            <SelectItem value="inactive">Inativos ({inactiveCount})</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Type Filter */}
                    <Select
                        value={filters.product_type || "all"}
                        onValueChange={(value) => setFilters({
                            ...filters,
                            product_type: value === "all" ? undefined : value as any
                        })}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Tipos</SelectItem>
                            <SelectItem value="beverage">Bebidas</SelectItem>
                            <SelectItem value="syrup">Xaropes</SelectItem>
                            <SelectItem value="concentrate">Concentrados</SelectItem>
                            <SelectItem value="other">Outros</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* View Mode */}
                    <div className="flex gap-1 border rounded-md p-1">
                        <Button
                            size="sm"
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            onClick={() => setViewMode('list')}
                        >
                            <LayoutList className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Products Grid/List */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : products.length > 0 ? (
                    <div className={
                        viewMode === 'grid'
                            ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                            : "space-y-4"
                    }>
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                stats={productsStats.get(product.id)}
                                onEdit={handleEdit}
                                onToggleActive={handleToggleActive}
                                onDelete={setDeletingProduct}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-muted-foreground">
                        <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">Nenhum produto encontrado</p>
                        <p className="text-sm mb-4">
                            {filters.search || filters.product_type
                                ? "Tente ajustar os filtros de pesquisa"
                                : "Clique em 'Novo Produto' para começar"
                            }
                        </p>
                        {(filters.search || filters.product_type) && (
                            <Button
                                variant="outline"
                                onClick={() => setFilters({ active: true, search: "" })}
                            >
                                Limpar Filtros
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Form Dialog */}
            <Dialog open={showForm} onOpenChange={(open) => {
                if (!open) handleCancelForm();
                setShowForm(open);
            }}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProduct ? "Editar Produto" : "Novo Produto"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingProduct
                                ? "Atualizar informações do produto"
                                : "Criar um novo produto no sistema"
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <ProductForm
                        product={editingProduct}
                        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                        onCancel={handleCancelForm}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingProduct} onOpenChange={(open) => {
                if (!open) setDeletingProduct(null);
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Produto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja eliminar <strong>{deletingProduct?.name}</strong>?
                            Esta ação não pode ser revertida e irá eliminar também todas as
                            especificações e testes associados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProduct}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppShell>
    );
}
