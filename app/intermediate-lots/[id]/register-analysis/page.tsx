"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ParameterGroupCard } from "@/components/production/ParameterGroupCard";
import { createClient } from "@/lib/supabase/client";
import { IntermediateLot } from "@/types/production";
import { ProductSpec } from "@/types/product";
import { useToast } from "@/components/ui/use-toast";
import { Save, ArrowLeft, FlaskConical } from "lucide-react";

export default function RegisterAnalysisPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lot, setLot] = useState<IntermediateLot | null>(null);
    const [specs, setSpecs] = useState<ProductSpec[]>([]);
    const [values, setValues] = useState<Record<string, number>>({});

    useEffect(() => {
        if (params.id) {
            loadData(params.id as string);
        }
    }, [params.id]);

    const loadData = async (lotId: string) => {
        setLoading(true);
        const supabase = createClient();

        try {
            const { data: lotData, error: lotError } = await supabase
                .from("intermediate_lots")
                .select(`
                    *,
                    production_lot:production_lots(
                        *,
                        product:products(*)
                    )
                `)
                .eq("id", lotId)
                .single();

            if (lotError) throw lotError;
            setLot(lotData);

            if (lotData?.production_lot?.product_id) {
                const { data: specsData, error: specsError } = await supabase
                    .from("product_specs")
                    .select(`
                        *,
                        parameter:parameters(*)
                    `)
                    .eq("product_id", lotData.production_lot.product_id)
                    .eq("test_level", "in_process");

                if (specsError) throw specsError;
                setSpecs(specsData || []);
            }
        } catch (error) {
            console.error("Error loading analysis data:", error);
            toast({ description: "Failed to load analysis data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleValueChange = (parameterId: string, value: number) => {
        setValues((prev) => ({
            ...prev,
            [parameterId]: value,
        }));
    };

    const checkSpecStatus = (paramId: string, value: number) => {
        const spec = specs.find((s) => s.parameter_id === paramId);
        if (!spec) return "unknown";

        const min = spec.spec_min ?? -Infinity;
        const max = spec.spec_max ?? Infinity;

        return value >= min && value <= max ? "in_spec" : "out_of_spec";
    };

    const handleSubmit = async () => {
        if (!lot) return;
        if (!lot.production_lot?.product_id) {
            toast({ description: "Product is missing for this lot", variant: "destructive" });
            return;
        }

        setSaving(true);
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id || null;

            const testsToCreate = Object.entries(values).map(([paramId, value]) => {
                const spec = specs.find((s) => s.parameter_id === paramId);

                return {
                    product_id: lot.production_lot!.product_id,
                    production_lot_id: lot.production_lot_id,
                    tank_id: lot.tank_id,
                    parameter_id: paramId,
                    measured_value: value,
                    spec_min: spec?.spec_min ?? null,
                    spec_target: spec?.spec_target ?? null,
                    spec_max: spec?.spec_max ?? null,
                    unit: spec?.unit ?? null,
                    result_status: checkSpecStatus(paramId, value),
                    test_level: "in_process",
                    tested_at: new Date().toISOString(),
                    tested_by: userId,
                };
            });

            if (testsToCreate.length === 0) {
                toast({ description: "No values recorded", variant: "destructive" });
                setSaving(false);
                return;
            }

            const { error } = await supabase.from("product_tests").insert(testsToCreate);
            if (error) throw error;

            toast({ title: "Analysis registered", description: "Results saved to product tests" });
            router.push("/intermediate-lots");
        } catch (error) {
            console.error("Error saving analysis:", error);
            const message = (error as any)?.message || "Failed to save analysis";
            toast({ title: "Error", description: message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const groupedSpecs = useMemo(() => {
        return specs.reduce((acc, spec) => {
            const category = spec.parameter?.category || "Other";
            if (!acc[category]) acc[category] = [];
            acc[category].push(spec);
            return acc;
        }, {} as Record<string, ProductSpec[]>);
    }, [specs]);

    if (loading) {
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
            <div className="p-6 space-y-6 max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Register Analysis</h1>
                        <p className="text-muted-foreground">
                            {lot?.code} • {lot?.production_lot?.product?.name}
                        </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <Button variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={saving} className="bg-primary">
                            <Save className="mr-2 h-4 w-4" />
                            {saving ? "Saving..." : "Save Results"}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <FlaskConical className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">In-Process Control</h3>
                                <p className="text-sm text-muted-foreground">
                                    Recording quality parameters for active production batch.
                                    Values outside specifications will be flagged automatically.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {Object.entries(groupedSpecs).map(([category, categorySpecs]) => (
                        <ParameterGroupCard
                            key={category}
                            title={category}
                            specs={categorySpecs}
                            values={values}
                            onChange={handleValueChange}
                        />
                    ))}

                    {specs.length === 0 && (
                        <Card className="bg-slate-900 border-slate-800 border-dashed">
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No specifications found for this product's in-process control.
                                <br />
                                Please configure product specifications first.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
