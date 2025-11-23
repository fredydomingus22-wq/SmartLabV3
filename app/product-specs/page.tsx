"use client"

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    getAllSpecsAggregated,
    getSpecsStats,
    SpecAggregated,
    SpecsStats
} from "@/lib/queries/product-specs";
import { getParametersWithUsage, ParameterWithUsage } from "@/lib/queries/parameters";
import { getProducts } from "@/lib/queries/products";
import { Product } from "@/types/product";
import { ParametersManager } from "./components/ParametersManager";
import { AllSpecsTable } from "./components/AllSpecsTable";
import { BulkOperations } from "./components/BulkOperations";
import {
    FileText,
    AlertCircle,
    Package,
    TestTube,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProductSpecsPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);

    // Overview data
    const [specs, setSpecs] = useState<SpecAggregated[]>([]);
    const [stats, setStats] = useState<SpecsStats | null>(null);

    // Parameters data
    const [parameters, setParameters] = useState<ParameterWithUsage[]>([]);

    // Products data
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [specsData, statsData, parametersData, productsData] = await Promise.all([
                getAllSpecsAggregated(),
                getSpecsStats(),
                getParametersWithUsage(),
                getProducts()
            ]);

            setSpecs(specsData);
            setStats(statsData);
            setParameters(parametersData);
            setProducts(productsData);
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
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

    // Calculate products without specs
    const productsWithSpecs = new Set(specs.map(s => s.product_id));
    const productsWithoutSpecs = products.filter(p => !productsWithSpecs.has(p.id));

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                {/* Header */}
                <SectionHeader
                    title="Product Specifications"
                    description="Manage specifications, parameters, and quality standards across all products"
                    action={
                        <Button onClick={loadData} variant="outline" size="icon">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    }
                />

                {/* KPI Cards */}
                {stats && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Specifications
                                </CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_specs}</div>
                                <p className="text-xs text-muted-foreground">
                                    Across all products
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Critical Specs
                                </CardTitle>
                                <AlertCircle className="h-4 w-4 text-destructive" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.critical_specs}</div>
                                <p className="text-xs text-muted-foreground">
                                    {((stats.critical_specs / stats.total_specs) * 100).toFixed(1)}% of total
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Parameters Used
                                </CardTitle>
                                <TestTube className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_parameters_used}</div>
                                <p className="text-xs text-muted-foreground">
                                    Unique parameters
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Products with Specs
                                </CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.total_products_with_specs}/{products.length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {((stats.total_products_with_specs / products.length) * 100).toFixed(0)}% coverage
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">
                            Overview ({specs.length})
                        </TabsTrigger>
                        <TabsTrigger value="parameters">
                            Parameters ({parameters.length})
                        </TabsTrigger>
                        <TabsTrigger value="operations">
                            Bulk Operations
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Overview */}
                    <TabsContent value="overview" className="space-y-4">
                        <AllSpecsTable specs={specs} />

                        {/* Products without specs alert */}
                        {productsWithoutSpecs.length > 0 && (
                            <Card className="border-amber-500/50">
                                <CardHeader>
                                    <CardTitle className="text-amber-600 flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        Action Needed
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm mb-3">
                                        {productsWithoutSpecs.length} product(s) without specifications:
                                    </p>
                                    <div className="space-y-1">
                                        {productsWithoutSpecs.slice(0, 5).map(product => (
                                            <div key={product.id} className="text-sm text-muted-foreground">
                                                • {product.name} ({product.sku})
                                            </div>
                                        ))}
                                        {productsWithoutSpecs.length > 5 && (
                                            <div className="text-sm text-muted-foreground">
                                                ... and {productsWithoutSpecs.length - 5} more
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Tab 2: Parameters */}
                    <TabsContent value="parameters" className="space-y-4">
                        <ParametersManager parameters={parameters} onRefresh={loadData} />
                    </TabsContent>

                    {/* Tab 3: Bulk Operations */}
                    <TabsContent value="operations" className="space-y-4">
                        <BulkOperations products={products} onRefresh={loadData} />
                    </TabsContent>
                </Tabs>
            </div>
        </AppShell>
    );
}
