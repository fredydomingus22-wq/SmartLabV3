"use client"

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTankById, createLineSampleWithAnalysis } from "@/lib/queries/production";
import { IntermediateTank } from "@/types/production";
import { getProductParametersWithLimits, ProductParameterSpec } from "@/lib/queries/parameters";
import { ParameterAnalysisForm } from "@/components/production/ParameterAnalysisForm";
import { SignatureInput, SignatureValue } from "@/components/form-runner/fields/SignatureInput";
import { toast } from "sonner";
import { Factory, Package, User, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewLineAnalysisClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tankId = searchParams.get("tank");

    const [tank, setTank] = useState<IntermediateTank | null>(null);
    const [specs, setSpecs] = useState<ProductParameterSpec[]>([]);
    const [values, setValues] = useState<Record<string, number>>({});
    const [signature, setSignature] = useState<SignatureValue | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (tankId) {
            loadData(tankId);
        }
    }, [tankId]);

    const loadData = async (id: string) => {
        try {
            const tankData = await getTankById(id);
            setTank(tankData);

            if (tankData?.production_lot?.product_id) {
                const specsData = await getProductParametersWithLimits(tankData.production_lot.product_id);
                setSpecs(specsData);
            }
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Erro ao carregar dados do tanque ou especificações.");
        } finally {
            setLoading(false);
        }
    };

    const handleParameterChange = (parameterId: string, value: number) => {
        setValues(prev => ({
            ...prev,
            [parameterId]: value
        }));
    };

    const handleSubmit = async () => {
        if (!tank || !signature) {
            toast.error("Por favor assine a análise antes de submeter.");
            return;
        }

        const missingParams = specs.filter(s => values[s.parameter_id] === undefined);
        if (missingParams.length > 0) {
            toast.error(`Faltam valores para ${missingParams.length} parâmetros.`);
            return;
        }

        setSubmitting(true);
        try {
            const analyses = specs.map(spec => ({
                parameter_id: spec.parameter_id,
                value: values[spec.parameter_id],
                lsl: spec.spec_min ?? undefined,
                target: spec.spec_target ?? undefined,
                usl: spec.spec_max ?? undefined,
                unit: spec.unit ?? undefined
            }));

            await createLineSampleWithAnalysis({
                tank_id: tank.id,
                production_lot_id: tank.production_lot_id,
                product_id: tank.production_lot!.product_id,
                sample_time: new Date().toISOString(),
                collected_by: signature.name,
                signature_data: JSON.stringify(signature),
                analyses
            });

            toast.success("Análise registada com sucesso!");
            router.push("/line-analysis");
        } catch (error) {
            console.error("Error submitting analysis:", error);
            toast.error("Erro ao submeter análise.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <AppShell>
                <div className="p-6 flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppShell>
        );
    }

    if (!tank) {
        return (
            <AppShell>
                <div className="p-6">
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Tanque não encontrado ou inválido.</p>
                        <Link href="/tanks">
                            <Button variant="outline" className="mt-4">Voltar aos Tanques</Button>
                        </Link>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="p-6 space-y-6 max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/tanks">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Nova Análise de Linha</h1>
                        <p className="text-muted-foreground">Registo de parâmetros e controlo de qualidade</p>
                    </div>
                </div>

                {/* Context Card */}
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-lg">Dados da Produção</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Factory className="h-4 w-4" />
                                Tanque
                            </div>
                            <div className="font-semibold text-lg">{tank.tank_code}</div>
                            <div className="text-xs text-muted-foreground">{tank.syrup_name}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Package className="h-4 w-4" />
                                Produto
                            </div>
                            <div className="font-semibold">{tank.production_lot?.product?.name}</div>
                            <div className="text-xs text-muted-foreground">{tank.production_lot?.product?.sku}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <User className="h-4 w-4" />
                                Preparado Por
                            </div>
                            <div className="font-medium">{tank.prepared_by}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Clock className="h-4 w-4" />
                                Hora da Amostra
                            </div>
                            <div className="font-medium">{new Date().toLocaleTimeString()}</div>
                            <div className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Parameters Form */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Parâmetros de Análise</h2>
                    <ParameterAnalysisForm
                        specs={specs}
                        values={values}
                        onChange={handleParameterChange}
                    />
                </div>

                {/* Signature Section */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h2 className="text-lg font-semibold">Validação Técnica</h2>
                    <div className="max-w-md">
                        <SignatureInput
                            fieldKey="technician_signature"
                            label="Assinatura do Técnico"
                            required
                            value={signature}
                            onChange={setSignature}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-6">
                    <Link href="/tanks">
                        <Button variant="outline" type="button">Cancelar</Button>
                    </Link>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || !signature}
                        className="bg-emerald-600 hover:bg-emerald-500 min-w-[150px]"
                    >
                        {submitting ? "A Submeter..." : "Registar Análise"}
                    </Button>
                </div>
            </div>
        </AppShell>
    );
}
