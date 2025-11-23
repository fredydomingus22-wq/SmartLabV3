"use client"

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProductionLots, createProductionLot, getProducts, updateProductionLotStatus } from "@/lib/queries/production";
import { getProfiles, Profile } from "@/lib/queries/profiles";
import { ProductionLot, Product } from "@/types/production";
import { Plus, Factory, Clock, Package, User } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";

export default function ProductionLotsPage() {
    const [lots, setLots] = useState<ProductionLot[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        product_id: "",
        factory_id: "",
        production_line: "",
        shift: "",
        status: "open" as ProductionLot["status"]
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [lotsData, productsData, profilesData] = await Promise.all([
                getProductionLots(),
                getProducts(),
                getProfiles() // Fetch all profiles, or filter by 'manager'/'supervisor' if needed
            ]);
            setLots(lotsData);
            setProducts(productsData);
            setProfiles(profilesData);
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createProductionLot({
                ...formData,
                factory_id: formData.factory_id || undefined, // Handle optional fields
                production_line: formData.production_line || undefined,
                shift: formData.shift || undefined
            });
            setFormData({
                code: "",
                product_id: "",
                factory_id: "",
                production_line: "",
                shift: "",
                status: "open"
            });
            setShowForm(false);
            loadData();
        } catch (error) {
            console.error("Error creating lot:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: ProductionLot["status"]) => {
        try {
            await updateProductionLotStatus(id, newStatus);
            loadData();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Lotes de Produção"
                    description="Gerir lotes e corridas de produção"
                    action={
                        <Button onClick={() => setShowForm(!showForm)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Lote de Produção
                        </Button>
                    }
                />

                {showForm && (
                    <div className="bg-card p-6 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4">Novo Lote de Produção</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="code">Lot Code *</Label>
                                    <Input
                                        id="code"
                                        placeholder="e.g., LOT-2024-001"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="product">Product *</Label>
                                    <Select
                                        value={formData.product_id}
                                        onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                                        required
                                    >
                                        <SelectTrigger id="product">
                                            <SelectValue placeholder="Select product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((product) => (
                                                <SelectItem key={product.id} value={product.id}>
                                                    {product.name} ({product.sku})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="factory">Factory Manager</Label>
                                    <Select
                                        value={formData.factory_id}
                                        onValueChange={(value) => setFormData({ ...formData, factory_id: value })}
                                    >
                                        <SelectTrigger id="factory">
                                            <SelectValue placeholder="Select manager" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {profiles.map((profile) => (
                                                <SelectItem key={profile.id} value={profile.id}>
                                                    {profile.full_name || profile.email} ({profile.role})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="line">Production Line</Label>
                                    <Input
                                        id="line"
                                        placeholder="e.g., Line A"
                                        value={formData.production_line}
                                        onChange={(e) => setFormData({ ...formData, production_line: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="shift">Shift</Label>
                                    <Select
                                        value={formData.shift}
                                        onValueChange={(value) => setFormData({ ...formData, shift: value })}
                                    >
                                        <SelectTrigger id="shift">
                                            <SelectValue placeholder="Select shift" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Morning">Morning</SelectItem>
                                            <SelectItem value="Afternoon">Afternoon</SelectItem>
                                            <SelectItem value="Night">Night</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Creating..." : "Create Lot"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {lots.map((lot) => (
                        <div key={lot.id} className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded">
                                    <Factory className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold">{lot.code}</h3>
                                        <StatusBadge status={lot.status} />
                                    </div>
                                    {lot.product && (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                                            <Package className="h-3 w-3" />
                                            <span>{lot.product.name}</span>
                                        </div>
                                    )}
                                    {lot.production_line && (
                                        <div className="text-xs text-muted-foreground mb-1">
                                            Line: {lot.production_line} {lot.shift && `(${lot.shift})`}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{new Date(lot.created_at).toLocaleDateString()}</span>
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        <Link href={`/tanks?lot=${lot.id}`}>
                                            <Button size="sm" variant="default">
                                                Ver Tanques
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
                                                onClick={() => handleStatusChange(lot.id, "closed")}
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

                {lots.length === 0 && !showForm && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Factory className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum lote de produção criado. Clique em "Novo Lote de Produção" para começar.</p>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
