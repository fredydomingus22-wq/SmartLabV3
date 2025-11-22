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
import { Plus, Beaker, ArrowRight, Clock, Thermometer, Activity } from "lucide-react";
import Link from "next/link";

export default function IntermediateLotsPage() {
    const [lots, setLots] = useState<IntermediateLot[]>([]);
    const [productionLots, setProductionLots] = useState<ProductionLot[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        production_lot_id: "",
        tank: "",
        brix: "",
        ph: "",
        acidity: "",
        ingredients: "" // JSON string for simplicity in this MVP
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
            await createIntermediateLot({
                code: formData.code,
                production_lot_id: formData.production_lot_id,
                tank: formData.tank || undefined,
                brix: formData.brix ? parseFloat(formData.brix) : undefined,
                ph: formData.ph ? parseFloat(formData.ph) : undefined,
                acidity: formData.acidity ? parseFloat(formData.acidity) : undefined,
                ingredients: formData.ingredients ? JSON.parse(formData.ingredients) : undefined
            });
            setFormData({
                code: "",
                production_lot_id: "",
                tank: "",
                brix: "",
                ph: "",
                acidity: "",
                ingredients: ""
            });
            setShowForm(false);
            loadData();
        } catch (error) {
            console.error("Error creating lot:", error);
            alert("Failed to create lot. Check inputs (e.g. valid JSON for ingredients).");
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <div>
                                    <Label htmlFor="tank">Tank / Vessel</Label>
                                    <Input
                                        id="tank"
                                        placeholder="e.g., Tank 5"
                                        value={formData.tank}
                                        onChange={(e) => setFormData({ ...formData, tank: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="ingredients">Ingredients (JSON)</Label>
                                    <Input
                                        id="ingredients"
                                        placeholder='e.g., {"water": "500L", "sugar": "50kg"}'
                                        value={formData.ingredients}
                                        onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <Label htmlFor="brix">Brix</Label>
                                        <Input
                                            id="brix"
                                            type="number"
                                            step="0.1"
                                            placeholder="0.0"
                                            value={formData.brix}
                                            onChange={(e) => setFormData({ ...formData, brix: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="ph">pH</Label>
                                        <Input
                                            id="ph"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.ph}
                                            onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="acidity">Acidity</Label>
                                        <Input
                                            id="acidity"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.acidity}
                                            onChange={(e) => setFormData({ ...formData, acidity: e.target.value })}
                                        />
                                    </div>
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
                                    <Beaker className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold">{lot.code}</h3>
                                        {lot.tank && (
                                            <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full">
                                                {lot.tank}
                                            </span>
                                        )}
                                    </div>

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

                                    <div className="grid grid-cols-3 gap-2 my-3 p-2 bg-muted/50 rounded text-center">
                                        <div>
                                            <div className="text-[10px] uppercase text-muted-foreground font-bold">Brix</div>
                                            <div className="font-mono text-sm">{lot.brix ?? '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase text-muted-foreground font-bold">pH</div>
                                            <div className="font-mono text-sm">{lot.ph ?? '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase text-muted-foreground font-bold">Acid</div>
                                            <div className="font-mono text-sm">{lot.acidity ?? '-'}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{new Date(lot.created_at).toLocaleDateString()}</span>
                                    </div>

                                    <div className="mt-3">
                                        <Link href={`/shared/forms/intermediate_lot/${lot.id}`}>
                                            <Button size="sm" variant="outline" className="w-full">
                                                <Activity className="mr-2 h-3 w-3" />
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
