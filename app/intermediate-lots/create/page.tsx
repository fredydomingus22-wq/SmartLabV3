"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, ArrowRight, Check, Beaker, Database, Scale, Plus, MinusCircle } from "lucide-react";
import { getActiveProductionLots } from "@/lib/queries/production";
import { getMixingTanks, MixingTank } from "@/lib/queries/production-settings";
import { getRawMaterials } from "@/lib/queries/inventory";
import { ProductionLot } from "@/types/production";
import { RawMaterial } from "@/types/inventory";
import { generateNextLotCode } from "@/lib/db-helpers";

export default function CreateIntermediateLotPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    // Data
    const [productionLots, setProductionLots] = useState<ProductionLot[]>([]);
    const [tanks, setTanks] = useState<MixingTank[]>([]);
    const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        productionLotId: "",
        tankId: "",
        quantity: "",
        unit: "L",
        startTime: new Date().toISOString().slice(0, 16),
        ingredients: [] as { rawMaterialId: string; quantity: number }[]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [lotsData, tanksRes, materialsData] = await Promise.all([
                getActiveProductionLots(),
                getMixingTanks(),
                getRawMaterials()
            ]);

            // Filter production lots that are not encerrado/concluido/fechado
            setProductionLots(lotsData);
            // Filter only active mixing tanks
            setTanks((tanksRes.data || []).filter(t => t.status === 'active'));
            setRawMaterials(materialsData);
        } catch (error) {
            console.error("Error loading data:", error);
            toast({
                title: "Error",
                description: "Failed to load form data",
                variant: "destructive",
            });
        } finally {
            setInitializing(false);
        }
    };

    const handleNext = () => {
        if (step === 1 && !formData.productionLotId) {
            toast({
                title: "Validation Error",
                description: "Please select a production lot",
                variant: "destructive",
            });
            return;
        }
        if (step === 2 && !formData.tankId) {
            toast({
                title: "Validation Error",
                description: "Please select a tank",
                variant: "destructive",
            });
            return;
        }
        if (step === 3 && (!formData.quantity || parseFloat(formData.quantity) <= 0)) {
            toast({
                title: "Validation Error",
                description: "Please enter a valid quantity",
                variant: "destructive",
            });
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const addIngredient = () => {
        setFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { rawMaterialId: "", quantity: 0 }]
        }));
    };

    const updateIngredient = (index: number, field: 'rawMaterialId' | 'quantity', value: string | number) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const removeIngredient = (index: number) => {
        const newIngredients = formData.ingredients.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        const supabase = createClient();

        try {
            const code = await generateNextLotCode('intermediate');

            // 1. Create Intermediate Lot
            const payload = {
                code,
                production_lot_id: formData.productionLotId,
                tank_id: formData.tankId,
                quantity: parseFloat(formData.quantity),
                unit: formData.unit,
                prepared_at: new Date(formData.startTime).toISOString(),
                status: 'active'
            };

            const { data: lot, error: lotError } = await supabase
                .from('intermediate_lots')
                .insert(payload)
                .select()
                .single();

            if (lotError) throw lotError;

            // 2. Insert ingredients separately
            if (formData.ingredients.length > 0) {
                const ingredientsData = formData.ingredients.map(ing => ({
                    intermediate_lot_id: lot.id,
                    raw_material_id: ing.rawMaterialId,
                    raw_material_name: rawMaterials.find(r => r.id === ing.rawMaterialId)?.name || 'Unknown',
                    quantity_used: ing.quantity,
                    unit: formData.unit
                }));

                const { error: ingredientsError } = await supabase
                    .from('intermediate_lot_ingredients')
                    .insert(ingredientsData);

                if (ingredientsError) {
                    console.error("Error creating ingredients:", ingredientsError);
                    // Note: lot was created successfully, just log ingredient error
                }
            }

            toast({
                title: "Success",
                description: "Intermediate lot created successfully",
            });
            router.refresh(); // Refresh server components/cache
            router.push('/intermediate-lots');

        } catch (error: any) {
            console.error("Error creating lot:", error);
            toast({
                title: "Error Creating Lot",
                description: error.message || "Unknown error occurred",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (initializing) {
        return (
            <AppShell>
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="p-6 space-y-6 max-w-3xl mx-auto">
                <SectionHeader
                    title="New Intermediate Lot"
                    description="Create a new batch of syrup, base, or intermediate product"
                    action={
                        <Button variant="ghost" onClick={() => router.back()}>
                            Cancel
                        </Button>
                    }
                />

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8 px-12">
                    {[
                        { id: 1, label: "Production Lot", icon: Database },
                        { id: 2, label: "Equipment", icon: Beaker },
                        { id: 3, label: "Details", icon: Scale },
                        { id: 4, label: "Ingredients", icon: Check },
                    ].map((s, i) => (
                        <div key={s.id} className="flex flex-col items-center relative z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${step >= s.id ? "bg-primary text-primary-foreground" : "bg-slate-800 text-slate-400"
                                }`}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-xs font-medium ${step >= s.id ? "text-primary" : "text-slate-500"}`}>
                                {s.label}
                            </span>
                            {i < 3 && (
                                <div className={`absolute top-5 left-1/2 w-[calc(100%+3rem)] h-[2px] -z-10 ${step > s.id ? "bg-primary" : "bg-slate-800"
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                <Card className="bg-slate-900 border-slate-800 min-h-[400px] flex flex-col">
                    <CardContent className="pt-6 flex-1">
                        {step === 1 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium mb-4">Select Production Lot</h3>
                                <div className="space-y-2">
                                    <Label>Production Lot</Label>
                                    <Select
                                        value={formData.productionLotId}
                                        onValueChange={(val) => setFormData({ ...formData, productionLotId: val })}
                                    >
                                        <SelectTrigger className="bg-slate-950 border-slate-800">
                                            <SelectValue placeholder="Select active production lot" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {productionLots.map((lot) => (
                                                <SelectItem key={lot.id} value={lot.id}>
                                                    {lot.code} - {lot.product?.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        Only production lots that are not encerrado/fechado are shown.
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium mb-4">Select Equipment</h3>
                                <div className="space-y-2">
                                    <Label>Tank / Vessel</Label>
                                    <Select
                                        value={formData.tankId}
                                        onValueChange={(val) => setFormData({ ...formData, tankId: val })}
                                    >
                                        <SelectTrigger className="bg-slate-950 border-slate-800">
                                            <SelectValue placeholder="Select equipment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tanks.map((tank) => (
                                                <SelectItem key={tank.id} value={tank.id}>
                                                    {tank.name} ({tank.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium mb-4">Batch Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Quantity</Label>
                                        <Input
                                            type="number"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            className="bg-slate-950 border-slate-800"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Unit</Label>
                                        <Select
                                            value={formData.unit}
                                            onValueChange={(val) => setFormData({ ...formData, unit: val })}
                                        >
                                            <SelectTrigger className="bg-slate-950 border-slate-800">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="L">Liters (L)</SelectItem>
                                                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                                <SelectItem value="gal">Gallons (gal)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Start Time</Label>
                                        <Input
                                            type="datetime-local"
                                            value={formData.startTime}
                                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                            className="bg-slate-950 border-slate-800"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium">Ingredients (Optional)</h3>
                                    <Button size="sm" variant="outline" onClick={addIngredient}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Ingredient
                                    </Button>
                                </div>

                                {formData.ingredients.length === 0 ? (
                                    <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg text-muted-foreground">
                                        No ingredients added.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {formData.ingredients.map((ing, idx) => (
                                            <div key={idx} className="flex gap-3 items-start p-3 bg-slate-950 rounded-lg border border-slate-800">
                                                <div className="flex-1 space-y-2">
                                                    <Label className="text-xs">Raw Material</Label>
                                                    <Select
                                                        value={ing.rawMaterialId}
                                                        onValueChange={(val) => updateIngredient(idx, 'rawMaterialId', val)}
                                                    >
                                                        <SelectTrigger className="h-9 bg-slate-900 border-slate-700">
                                                            <SelectValue placeholder="Select material" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {rawMaterials.map((rm) => (
                                                                <SelectItem key={rm.id} value={rm.id}>
                                                                    {rm.name} ({rm.code})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="w-32 space-y-2">
                                                    <Label className="text-xs">Qty</Label>
                                                    <Input
                                                        type="number"
                                                        value={ing.quantity}
                                                        onChange={(e) => updateIngredient(idx, 'quantity', parseFloat(e.target.value))}
                                                        className="h-9 bg-slate-900 border-slate-700"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="mt-6 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                    onClick={() => removeIngredient(idx)}
                                                >
                                                    <MinusCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>

                    <div className="p-6 border-t border-slate-800 flex justify-between bg-slate-950/50">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={step === 1 || loading}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>

                        {step < 4 ? (
                            <Button onClick={handleNext} className="bg-primary">
                                Next
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700">
                                {loading ? "Creating..." : "Create Lot"}
                                <Check className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </AppShell>
    );
}
