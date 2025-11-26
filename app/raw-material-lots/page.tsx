"use client"

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRawMaterialLots, createRawMaterialLot, getRawMaterials } from "@/lib/queries/inventory";
import { RawMaterialLot, RawMaterial } from "@/types/inventory";
import { Plus, PackageCheck, Clock, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { getTraceabilityGraph, TraceabilityGraph } from "@/lib/queries/traceability";
import { usePermissions } from "@/lib/hooks/usePermissions";

export default function RawMaterialLotsPage() {
    const [lots, setLots] = useState<RawMaterialLot[]>([]);
    const [materials, setMaterials] = useState<RawMaterial[]>([]);
    const [traceGraph, setTraceGraph] = useState<TraceabilityGraph | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        lot_code: "",
        raw_material_id: "",
        status: "pending" as RawMaterialLot["status"]
    });
    const [loading, setLoading] = useState(false);
    const { permissions, isLoading: permissionsLoading } = usePermissions();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [lotsData, materialsData, graph] = await Promise.all([
                getRawMaterialLots(),
                getRawMaterials(),
                getTraceabilityGraph()
            ]);
            setLots(lotsData);
            setMaterials(materialsData);
            setTraceGraph(graph);
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createRawMaterialLot(formData);
            setFormData({ lot_code: "", raw_material_id: "", status: "pending" });
            setShowForm(false);
            loadData();
        } catch (error) {
            console.error("Error creating lot:", error);
        } finally {
            setLoading(false);
        }
    };

    const getIntermediateChildren = (lot: RawMaterialLot) => {
        if (!traceGraph) return [];
        return traceGraph.intermediate_lots.filter((intermediateLot: any) =>
            (intermediateLot.ingredients || []).some(
                (ingredient: any) =>
                    ingredient.raw_material_id === lot.raw_material_id ||
                    ingredient.lot_number === lot.lot_code
            )
        );
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Raw Material Lots"
                    description="Receive and inspect incoming raw material batches"
                    action={
                        <Button onClick={() => setShowForm(!showForm)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Receive Lot
                        </Button>
                    }
                />

                {showForm && (
                    <div className="bg-card p-6 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4">Receive New Lot</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="material">Raw Material *</Label>
                                <Select
                                    value={formData.raw_material_id}
                                    onValueChange={(value) => setFormData({ ...formData, raw_material_id: value })}
                                    required
                                >
                                    <SelectTrigger id="material">
                                        <SelectValue placeholder="Select material" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {materials.map((material) => (
                                            <SelectItem key={material.id} value={material.id}>
                                                {material.name} {material.code && `(${material.code})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="lot_code">Lot/Batch Code *</Label>
                                <Input
                                    id="lot_code"
                                    placeholder="Supplier's lot code"
                                    value={formData.lot_code}
                                    onChange={(e) => setFormData({ ...formData, lot_code: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="status">Initial Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value as RawMaterialLot["status"] })}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending Inspection</SelectItem>
                                        <SelectItem value="quarantine">Quarantine</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Receiving..." : "Receive Lot"}
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
                                    <PackageCheck className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold">{lot.lot_code}</h3>
                                        <StatusBadge status={lot.status} />
                                    </div>
                                    {lot.raw_material && (
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {lot.raw_material.name}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>Received {new Date(lot.created_at).toLocaleDateString()}</span>
                                    </div>

                                    {!permissionsLoading && permissions.canViewReports && (
                                        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <ArrowRight className="h-3 w-3" />
                                                <span>{getIntermediateChildren(lot).length} intermediate lots using this batch</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {getIntermediateChildren(lot).slice(0, 3).map((child) => (
                                                    <Link key={child.id} href={`/intermediate-lots?lot=${child.production_lot_id}`} className="text-primary hover:underline">
                                                        {child.code}
                                                    </Link>
                                                ))}
                                                {getIntermediateChildren(lot).length === 0 && (
                                                    <span className="text-muted-foreground">No consumption registered yet</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-3">
                                        <Link href={`/shared/forms/raw_material_lot/${lot.id}`}>
                                            <Button size="sm" variant="outline">
                                                Inspection Forms
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
                        <PackageCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No raw material lots received yet. Click "Receive Lot" to start.</p>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
