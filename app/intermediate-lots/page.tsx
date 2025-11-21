"use client"

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getIntermediateLots, createIntermediateLot, getProductionLots } from "@/lib/queries/production";
import { IntermediateLot, ProductionLot } from "@/types/production";
import { Plus, Beaker, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";

export default function IntermediateLotsPage() {
    const [lots, setLots] = useState<IntermediateLot[]>([]);
    const [productionLots, setProductionLots] = useState<ProductionLot[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        production_lot_id: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [lotsData, prodLotsData] = await Promise.all([
                getIntermediateLots(),
                getProductionLots()
            ]);
            setLots(lotsData);
            setProductionLots(prodLotsData.filter(lot => lot.status === 'open'));
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createIntermediateLot(formData);
            setFormData({ code: "", production_lot_id: "" });
            setShowForm(false);
            loadData();
        } catch (error) {
            console.error("Error creating lot:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Intermediate Lots"
                    description="Manage syrups, bases, and intermediate products"
                    action={
                        <Button onClick={() => setShowForm(!showForm)}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Intermediate Lot
                        </Button>
                    }
                />

                {showForm && (
                    <div className="bg-card p-6 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4">New Intermediate Lot</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="production_lot">Parent Production Lot *</Label>
                                <Select
                                    value={formData.production_lot_id}
                                    onValueChange={(value) => setFormData({ ...formData, production_lot_id: value })}
                                    required
                                >
                                    <SelectTrigger id="production_lot">
                                        <SelectValue placeholder="Select production lot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productionLots.map((lot) => (
                                            <SelectItem key={lot.id} value={lot.id}>
                                                {lot.code} {lot.product && `- ${lot.product.name}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="code">Intermediate Lot Code *</Label>
                                <Input
                                    id="code"
                                    placeholder="e.g., INT-2024-001"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
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
                                    <Beaker className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold mb-2">{lot.code}</h3>

                                    {lot.production_lot && (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                            <ArrowRight className="h-3 w-3" />
                                            <span>{lot.production_lot.code}</span>
                                        </div>
                                    )}

                                    {lot.production_lot?.product && (
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Product: {lot.production_lot.product.name}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{new Date(lot.created_at).toLocaleDateString()}</span>
                                    </div>

                                    <div className="mt-3">
                                        <Link href={`/shared/forms/intermediate_lot/${lot.id}`}>
                                            <Button size="sm" variant="outline">
                                                Quality Tests
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {lots.length === 0 && !showForm && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Beaker className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No intermediate lots yet. Click "New Intermediate Lot" to get started.</p>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
