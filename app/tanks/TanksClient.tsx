"use client"

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTanks, getTanksByProductionLot, createTank, updateTankStatus, getProductionLots } from "@/lib/queries/production";
import { IntermediateTank, ProductionLot } from "@/types/production";
import { Plus, Beaker, Clock, Factory, User, FileText } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";

export default function TanksClient() {
    const searchParams = useSearchParams();
    const lotId = searchParams.get("lot");

    const [tanks, setTanks] = useState<IntermediateTank[]>([]);
    const [productionLots, setProductionLots] = useState<ProductionLot[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        production_lot_id: lotId || "",
        tank_code: "",
        syrup_name: "",
        prepared_by: "",
        start_at: new Date().toISOString().slice(0, 16),
        status: "active" as "active" | "finished"
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [lotId]);

    const loadData = async () => {
        try {
            if (lotId) {
                const tanksData = await getTanksByProductionLot(lotId);
                setTanks(tanksData);
            } else {
                const tanksData = await getTanks();
                setTanks(tanksData);
            }
            const lotsData = await getProductionLots();
            setProductionLots(lotsData.filter(lot => lot.status === 'open'));
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newTank = await createTank({
                ...formData,
                end_at: null
            });

            setFormData({
                production_lot_id: lotId || "",
                tank_code: "",
                syrup_name: "",
                prepared_by: "",
                start_at: new Date().toISOString().slice(0, 16),
                status: "active"
            });
            setShowForm(false);
            loadData();

            // Redirect to ingredient registration (form builder)
            if (newTank.id && typeof window !== 'undefined') {
                window.location.href = `/shared/forms/intermediate_tank/${newTank.id}`;
            }
        } catch (error) {
            console.error("Error creating tank:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFinishTank = async (tankId: string) => {
        try {
            await updateTankStatus(tankId, "finished", new Date().toISOString());
            loadData();
        } catch (error) {
            console.error("Error updating tank status:", error);
        }
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Tanques / Produto Intermédio"
                    description="Gerir tanques de xarope e preparação"
                    action={
                        <Button onClick={() => setShowForm(!showForm)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Tanque
                        </Button>
                    }
                />

                {showForm && (
                    <div className="bg-card p-6 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4">Novo Tanque</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="production_lot">Lote de Produção *</Label>
                                    <Select
                                        value={formData.production_lot_id}
                                        onValueChange={(value) => setFormData({ ...formData, production_lot_id: value })}
                                        required
                                    >
                                        <SelectTrigger id="production_lot">
                                            <SelectValue placeholder="Selecionar lote" />
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
                                    <Label htmlFor="tank_code">Código do Tanque *</Label>
                                    <Input
                                        id="tank_code"
                                        placeholder="ex: TK501"
                                        value={formData.tank_code}
                                        onChange={(e) => setFormData({ ...formData, tank_code: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="syrup_name">Nome do Xarope *</Label>
                                    <Input
                                        id="syrup_name"
                                        placeholder="ex: Xarope Cola"
                                        value={formData.syrup_name}
                                        onChange={(e) => setFormData({ ...formData, syrup_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="prepared_by">Preparado por *</Label>
                                    <Input
                                        id="prepared_by"
                                        placeholder="Nome do técnico"
                                        value={formData.prepared_by}
                                        onChange={(e) => setFormData({ ...formData, prepared_by: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="start_at">Início</Label>
                                    <Input
                                        id="start_at"
                                        type="datetime-local"
                                        value={formData.start_at}
                                        onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={loading}>
                                    {loading ? "A Criar..." : "Criar Tanque"}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    Cancelar
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                * Após criar o tanque, será redirecionado para registar os ingredientes
                            </p>
                        </form>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tanks.map((tank) => (
                        <div key={tank.id} className="bg-card p-4 rounded-lg border hover:border-primary transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded">
                                    <Beaker className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold">{tank.tank_code}</h3>
                                        <StatusBadge status={tank.status} />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        {tank.syrup_name}
                                    </p>
                                    {tank.production_lot && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                            <Factory className="h-3 w-3" />
                                            <span>{tank.production_lot.code}</span>
                                        </div>
                                    )}
                                    {tank.prepared_by && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                            <User className="h-3 w-3" />
                                            <span>{tank.prepared_by}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{new Date(tank.start_at).toLocaleString()}</span>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <Link href={`/shared/forms/intermediate_tank/${tank.id}`}>
                                            <Button size="sm" variant="outline">
                                                <FileText className="mr-1 h-3 w-3" />
                                                Ingredientes
                                            </Button>
                                        </Link>

                                        {tank.status === "active" && (
                                            <>
                                                <Link href={`/line-analysis/new?tank=${tank.id}`}>
                                                    <Button size="sm" variant="default">
                                                        Analisar Amostra
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleFinishTank(tank.id)}
                                                >
                                                    Finalizar
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {tanks.length === 0 && !showForm && (
                    <div className="text-center py-12 text-muted-foreground">
                        <Beaker className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum tanque criado. Clique em "Novo Tanque" para começar.</p>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
