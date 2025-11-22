"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowLeft,
    Package,
    AlertTriangle,
    Plus,
    Beaker,
    Calendar,
    TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
    getReagentById,
    getBatchesByReagent,
    createBatch,
    recordUsage,
    getUsageHistory,
} from "@/lib/queries/reagents";
import { ReagentWithStock, ReagentBatch, ReagentUsage } from "@/types/reagent";

export default function ReagentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const reagentId = params.id as string;

    const [reagent, setReagent] = useState<ReagentWithStock | null>(null);
    const [batches, setBatches] = useState<ReagentBatch[]>([]);
    const [usageHistory, setUsageHistory] = useState<ReagentUsage[]>([]);
    const [loading, setLoading] = useState(true);

    const [batchDialogOpen, setBatchDialogOpen] = useState(false);
    const [usageDialogOpen, setUsageDialogOpen] = useState(false);

    const [batchForm, setBatchForm] = useState({
        batch_number: "",
        lot_number: "",
        received_quantity: 0,
        expiration_date: "",
        manufacture_date: "",
    });

    const [usageForm, setUsageForm] = useState({
        batch_id: "",
        quantity_used: 0,
        usage_type: "analysis" as const,
        purpose: "",
        notes: "",
    });

    useEffect(() => {
        if (reagentId) {
            loadReagentData();
        }
    }, [reagentId]);

    async function loadReagentData() {
        try {
            const [reagentData, batchesData, usageData] = await Promise.all([
                getReagentById(reagentId),
                getBatchesByReagent(reagentId),
                getUsageHistory(reagentId, 20),
            ]);

            setReagent(reagentData);
            setBatches(batchesData);
            setUsageHistory(usageData);
        } catch (error) {
            console.error("Error loading reagent:", error);
            toast.error("Failed to load reagent details");
        } finally {
            setLoading(false);
        }
    }

    async function handleAddBatch(e: React.FormEvent) {
        e.preventDefault();
        try {
            await createBatch({
                reagent_id: reagentId,
                ...batchForm,
                quantity_remaining: batchForm.received_quantity,
                unit: reagent?.unit || "L",
                qc_status: "pending",
            });
            toast.success("Batch received successfully");
            setBatchDialogOpen(false);
            loadReagentData();
            setBatchForm({
                batch_number: "",
                lot_number: "",
                received_quantity: 0,
                expiration_date: "",
                manufacture_date: "",
            });
        } catch (error) {
            console.error("Error adding batch:", error);
            toast.error("Failed to receive batch");
        }
    }

    async function handleRecordUsage(e: React.FormEvent) {
        e.preventDefault();
        try {
            await recordUsage({
                reagent_id: reagentId,
                ...usageForm,
                unit: reagent?.unit || "L",
            });
            toast.success("Usage recorded successfully");
            setUsageDialogOpen(false);
            loadReagentData();
            setUsageForm({
                batch_id: "",
                quantity_used: 0,
                usage_type: "analysis",
                purpose: "",
                notes: "",
            });
        } catch (error) {
            console.error("Error recording usage:", error);
            toast.error("Failed to record usage");
        }
    }

    function getQCBadge(status: string) {
        const variants: Record<string, { color: string; label: string }> = {
            pending: { color: "bg-yellow-600", label: "Pending QC" },
            approved: { color: "bg-green-600", label: "Approved" },
            rejected: { color: "bg-red-600", label: "Rejected" },
            expired: { color: "bg-gray-600", label: "Expired" },
        };
        const variant = variants[status] || variants.pending;
        return <Badge className={variant.color}>{variant.label}</Badge>;
    }

    function isExpiringSoon(date: string) {
        const daysUntil = Math.ceil(
            (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return daysUntil <= 30 && daysUntil > 0;
    }

    function isExpired(date: string) {
        return new Date(date) < new Date();
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">Loading...</div>
                </div>
            </div>
        );
    }

    if (!reagent) {
        return (
            <div className="p-8">
                <div className="text-center">
                    <p className="text-muted-foreground">Reagent not found</p>
                    <Link href="/reagents">
                        <Button className="mt-4">Back to Reagents</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/reagents">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-white">{reagent.name}</h1>
                            <Badge className="bg-blue-600">{reagent.code}</Badge>
                        </div>
                        <p className="text-muted-foreground">
                            {reagent.formula && `${reagent.formula} • `}
                            {reagent.cas_number && `CAS: ${reagent.cas_number}`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                Receive Batch
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Receive New Batch</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddBatch} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Batch Number *</Label>
                                        <Input
                                            value={batchForm.batch_number}
                                            onChange={(e) =>
                                                setBatchForm({ ...batchForm, batch_number: e.target.value })
                                            }
                                            placeholder="e.g., B2024-001"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Lot Number</Label>
                                        <Input
                                            value={batchForm.lot_number}
                                            onChange={(e) =>
                                                setBatchForm({ ...batchForm, lot_number: e.target.value })
                                            }
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Received Quantity *</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={batchForm.received_quantity}
                                            onChange={(e) =>
                                                setBatchForm({
                                                    ...batchForm,
                                                    received_quantity: Number(e.target.value),
                                                })
                                            }
                                            required
                                        />
                                        <div className="flex items-center px-3 bg-slate-800 border border-slate-700 rounded text-sm">
                                            {reagent.unit}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Manufacture Date</Label>
                                        <Input
                                            type="date"
                                            value={batchForm.manufacture_date}
                                            onChange={(e) =>
                                                setBatchForm({ ...batchForm, manufacture_date: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Expiration Date *</Label>
                                        <Input
                                            type="date"
                                            value={batchForm.expiration_date}
                                            onChange={(e) =>
                                                setBatchForm({ ...batchForm, expiration_date: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setBatchDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">Receive Batch</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={usageDialogOpen} onOpenChange={setUsageDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Beaker className="w-4 h-4" />
                                Record Usage
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Record Reagent Usage</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleRecordUsage} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Select Batch *</Label>
                                    <Select
                                        value={usageForm.batch_id}
                                        onValueChange={(value) =>
                                            setUsageForm({ ...usageForm, batch_id: value })
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose batch (FIFO recommended)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {batches
                                                .filter((b) => b.qc_status === "approved" && b.quantity_remaining > 0)
                                                .map((batch) => (
                                                    <SelectItem key={batch.id} value={batch.id}>
                                                        {batch.batch_number} - {batch.quantity_remaining.toFixed(2)}{" "}
                                                        {batch.unit} remaining
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Quantity Used *</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={usageForm.quantity_used}
                                            onChange={(e) =>
                                                setUsageForm({
                                                    ...usageForm,
                                                    quantity_used: Number(e.target.value),
                                                })
                                            }
                                            required
                                        />
                                        <div className="flex items-center px-3 bg-slate-800 border border-slate-700 rounded text-sm">
                                            {reagent.unit}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Usage Type *</Label>
                                    <Select
                                        value={usageForm.usage_type}
                                        onValueChange={(value: any) =>
                                            setUsageForm({ ...usageForm, usage_type: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="analysis">Analysis</SelectItem>
                                            <SelectItem value="preparation">Preparation</SelectItem>
                                            <SelectItem value="calibration">Calibration</SelectItem>
                                            <SelectItem value="cleaning">Cleaning</SelectItem>
                                            <SelectItem value="waste">Waste</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Purpose</Label>
                                    <Input
                                        value={usageForm.purpose}
                                        onChange={(e) =>
                                            setUsageForm({ ...usageForm, purpose: e.target.value })
                                        }
                                        placeholder="e.g., pH adjustment for sample XYZ"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Notes</Label>
                                    <Textarea
                                        value={usageForm.notes}
                                        onChange={(e) =>
                                            setUsageForm({ ...usageForm, notes: e.target.value })
                                        }
                                        placeholder="Additional notes..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setUsageDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">Record Usage</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Current Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {reagent.stock_current.toFixed(2)} {reagent.unit}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Min: {reagent.stock_min} {reagent.unit}
                        </p>
                        {reagent.low_stock && (
                            <Badge variant="destructive" className="mt-2">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Low Stock
                            </Badge>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Batches
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{batches.length}</div>
                        <p className="text-sm text-muted-foreground">
                            {batches.filter((b) => b.qc_status === "approved").length} approved
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Expiring Soon
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">
                            {reagent.expiring_soon_count}
                        </div>
                        <p className="text-sm text-muted-foreground">Within 30 days</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Storage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium text-white">{reagent.storage_location}</div>
                        {reagent.hazard_class && (
                            <Badge variant="destructive" className="mt-2">
                                {reagent.hazard_class}
                            </Badge>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Batches Table */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle>Batches</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800">
                                <TableHead className="text-white">Batch #</TableHead>
                                <TableHead className="text-white">Lot #</TableHead>
                                <TableHead className="text-white">Received</TableHead>
                                <TableHead className="text-white">Remaining</TableHead>
                                <TableHead className="text-white">Expiration</TableHead>
                                <TableHead className="text-white">QC Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {batches.map((batch) => (
                                <TableRow key={batch.id} className="border-slate-800">
                                    <TableCell className="font-mono">{batch.batch_number}</TableCell>
                                    <TableCell className="font-mono text-muted-foreground">
                                        {batch.lot_number || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {batch.received_quantity} {batch.unit}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={
                                                batch.quantity_remaining <= 0 ? "text-red-500" : ""
                                            }
                                        >
                                            {batch.quantity_remaining.toFixed(2)} {batch.unit}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-muted-foreground" />
                                            <span
                                                className={
                                                    batch.expiration_date
                                                        ? isExpired(batch.expiration_date)
                                                            ? "text-red-500"
                                                            : isExpiringSoon(batch.expiration_date)
                                                                ? "text-yellow-500"
                                                                : ""
                                                        : ""
                                                }
                                            >
                                                {batch.expiration_date
                                                    ? new Date(batch.expiration_date).toLocaleDateString()
                                                    : "-"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getQCBadge(batch.qc_status)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {batches.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No batches received yet
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Usage History */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5" />
                        Recent Usage
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800">
                                <TableHead className="text-white">Date</TableHead>
                                <TableHead className="text-white">Quantity</TableHead>
                                <TableHead className="text-white">Type</TableHead>
                                <TableHead className="text-white">Purpose</TableHead>
                                <TableHead className="text-white">User</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usageHistory.map((usage) => (
                                <TableRow key={usage.id} className="border-slate-800">
                                    <TableCell>
                                        {new Date(usage.used_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {usage.quantity_used} {usage.unit}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{usage.usage_type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">{usage.purpose || "-"}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {(usage as any).user?.full_name || "Unknown"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {usageHistory.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No usage recorded yet
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
