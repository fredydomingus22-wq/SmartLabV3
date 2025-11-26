"use client"

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getFinishedLots, createFinishedLot, getIntermediateLots, updateFinishedLotStatus } from "@/lib/queries/production";
import { FinishedLot, IntermediateLot } from "@/types/production";
import { Plus, Package, ArrowRight, Clock, CheckCircle, XCircle, FileText, Truck } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { getTraceabilityGraph, TraceabilityGraph } from "@/lib/queries/traceability";
import { usePermissions } from "@/lib/hooks/usePermissions";

export default function FinishedLotsPage() {
    const [lots, setLots] = useState<FinishedLot[]>([]);
    const [intermediateLots, setIntermediateLots] = useState<IntermediateLot[]>([]);
    const [traceGraph, setTraceGraph] = useState<TraceabilityGraph | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        intermediate_lot_id: "",
        status: "quarantine" as FinishedLot["status"]
    });
    const [loading, setLoading] = useState(false);
    const { permissions, isLoading: permissionsLoading } = usePermissions();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [lotsData, intLotsData, graphData] = await Promise.all([
                getFinishedLots(),
                getIntermediateLots(),
                getTraceabilityGraph()
            ]);
            setLots(lotsData);
            setIntermediateLots(intLotsData);
            setTraceGraph(graphData);
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createFinishedLot(formData);
            setFormData({ code: "", intermediate_lot_id: "", status: "quarantine" });
            setShowForm(false);
            loadData();
        } catch (error) {
            console.error("Error creating lot:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: FinishedLot["status"]) => {
        if (!confirm(`Are you sure you want to change status to ${newStatus.toUpperCase()}?`)) return;

        try {
            await updateFinishedLotStatus(id, newStatus);
            loadData();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleGenerateCOA = (lot: FinishedLot) => {
        // Mock COA Generation - In a real app, this would generate a PDF
        const coaContent = `
CERTIFICATE OF ANALYSIS
-----------------------
Lot Code: ${lot.code}
Product: ${lot.intermediate_lot?.production_lot?.product?.name || 'N/A'}
Date: ${new Date().toLocaleDateString()}
Status: ${lot.status.toUpperCase()}

Analysis Results:
- pH: ${lot.ph || 'N/A'}
- Brix: ${lot.brix || 'N/A'}
- Density: ${lot.density || 'N/A'}

Approved By: QA Manager
        `;

        const blob = new Blob([coaContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `COA-${lot.code}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getRelatedQualitySignals = (lot: FinishedLot) => {
        if (!traceGraph) return { samples: [], ncs: [] };
        const samples = traceGraph.samples.filter(
            (sample) =>
                sample.intermediate_lot_id === lot.intermediate_lot_id ||
                sample.production_lot_id === (lot as any).intermediate_lot?.production_lot_id
        );
        const ncs = traceGraph.non_conformities.filter(
            (nc) => nc.sample_id && samples.some((sample) => sample.id === nc.sample_id)
        );
        return { samples, ncs };
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Finished Lots"
                    description="Final products pending quality release"
                    action={
                        <Button onClick={() => setShowForm(!showForm)}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Finished Lot
                        </Button>
                    }
                />

                {showForm && (
                    <div className="bg-card p-6 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4">New Finished Lot</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="intermediate_lot">Source Intermediate Lot *</Label>
                                <Select
                                    value={formData.intermediate_lot_id}
                                    onValueChange={(value) => setFormData({ ...formData, intermediate_lot_id: value })}
                                    required
                                >
                                    <SelectTrigger id="intermediate_lot">
                                        <SelectValue placeholder="Select intermediate lot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {intermediateLots.map((lot) => (
                                            <SelectItem key={lot.id} value={lot.id}>
                                                {lot.code} {lot.production_lot?.product && `- ${lot.production_lot.product.name}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="code">Finished Lot Code *</Label>
                                <Input
                                    id="code"
                                    placeholder="e.g., FIN-2024-001"
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
                                    <Package className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold">{lot.code}</h3>
                                        <StatusBadge status={lot.status} />
                                    </div>

                                    {lot.intermediate_lot && (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                                            <ArrowRight className="h-3 w-3" />
                                            <span>{lot.intermediate_lot.code}</span>
                                        </div>
                                    )}

                                    {lot.intermediate_lot?.production_lot?.product && (
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {lot.intermediate_lot.production_lot.product.name}
                                        </p>
                                    )}

                                    {!permissionsLoading && permissions.canViewReports && (
                                        <div className="text-xs text-muted-foreground space-y-1 mb-2">
                                            <div className="flex items-center gap-2">
                                                <ArrowRight className="h-3 w-3" />
                                                <span>
                                                    Origem: {lot.intermediate_lot?.production_lot?.code || "PL"}
                                                </span>
                                            </div>
                                            {(() => {
                                                const signals = getRelatedQualitySignals(lot);
                                                return (
                                                    <div className="flex flex-wrap gap-3">
                                                        <span>{signals.samples.length} análises</span>
                                                        <span>{signals.ncs.length} NC ligadas</span>
                                                        <Link
                                                            href={`/traceability/${encodeURIComponent(lot.code)}`}
                                                            className="text-primary hover:underline"
                                                        >
                                                            Ver cadeia completa
                                                        </Link>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                                        <Clock className="h-3 w-3" />
                                        <span>{new Date(lot.created_at).toLocaleDateString()}</span>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Link href={`/shared/forms/finished_lot/${lot.id}`}>
                                            <Button size="sm" variant="outline">
                                                Final Tests
                                            </Button>
                                        </Link>

                                        {lot.status === "quarantine" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() => handleStatusChange(lot.id, "approved")}
                                                >
                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleStatusChange(lot.id, "rejected")}
                                                >
                                                    <XCircle className="mr-1 h-3 w-3" />
                                                    Reject
                                                </Button>
                                            </>
                                        )}

                                        {lot.status === "approved" && (
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => handleStatusChange(lot.id, "released")}
                                            >
                                                <Truck className="mr-1 h-3 w-3" />
                                                Release
                                            </Button>
                                        )}

                                        {lot.status === "released" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleGenerateCOA(lot)}
                                            >
                                                <FileText className="mr-1 h-3 w-3" />
                                                COA
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
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No finished lots yet. Click "New Finished Lot" to get started.</p>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
