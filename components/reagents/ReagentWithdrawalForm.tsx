"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ReagentWithStock } from "@/types/reagent";
import { ArrowUpFromLine, AlertTriangle } from "lucide-react";

interface ReagentWithdrawalFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reagent: ReagentWithStock | null;
    onSuccess?: () => void;
}

export function ReagentWithdrawalForm({
    open,
    onOpenChange,
    reagent,
    onSuccess
}: ReagentWithdrawalFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        quantity: "",
        purpose: "",
        used_by: "",
        batch_number: "",
        notes: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reagent) return;

        const quantity = parseFloat(formData.quantity);

        // Validation
        if (quantity > reagent.stock_current) {
            toast.error(`Insufficient stock! Available: ${reagent.stock_current} ${reagent.unit}`);
            return;
        }

        setLoading(true);
        try {
            // Create stock movement withdrawal
            const response = await fetch("/api/reagents/movements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reagent_id: reagent.id,
                    movement_type: "withdrawal",
                    quantity: quantity,
                    purpose: formData.purpose,
                    used_by: formData.used_by,
                    batch_number: formData.batch_number,
                    notes: formData.notes,
                }),
            });

            if (!response.ok) throw new Error("Failed to register withdrawal");

            toast.success(`Withdrawal registered: -${formData.quantity} ${reagent.unit}`);

            // Reset form
            setFormData({
                quantity: "",
                purpose: "",
                used_by: "",
                batch_number: "",
                notes: "",
            });

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error("Error registering withdrawal:", error);
            toast.error("Failed to register withdrawal");
        } finally {
            setLoading(false);
        }
    };

    const willBeLowStock = reagent && (reagent.stock_current - parseFloat(formData.quantity || "0")) < reagent.stock_min;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowUpFromLine className="w-5 h-5 text-red-500" />
                        Register Withdrawal - {reagent?.name}
                    </DialogTitle>
                    <DialogDescription>
                        Remove stock from inventory. Available: {reagent?.stock_current} {reagent?.unit}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {willBeLowStock && formData.quantity && (
                        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/50 rounded-md">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span className="text-sm text-amber-500">
                                Warning: Stock will be below minimum level after this withdrawal!
                            </span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity *</Label>
                            <Input
                                id="quantity"
                                type="number"
                                step="0.01"
                                placeholder={`Amount in ${reagent?.unit}`}
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                required
                                className="bg-slate-900 border-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="batch_number">Batch Number</Label>
                            <Input
                                id="batch_number"
                                placeholder="e.g., BATCH-2024-001"
                                value={formData.batch_number}
                                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                                className="bg-slate-900 border-slate-800"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="purpose">Purpose *</Label>
                        <Select
                            value={formData.purpose}
                            onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                            required
                        >
                            <SelectTrigger className="bg-slate-900 border-slate-800">
                                <SelectValue placeholder="Select purpose" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="production">Production</SelectItem>
                                <SelectItem value="analysis">Lab Analysis</SelectItem>
                                <SelectItem value="calibration">Equipment Calibration</SelectItem>
                                <SelectItem value="r&d">R&D / Testing</SelectItem>
                                <SelectItem value="waste">Disposal / Waste</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="used_by">Used By</Label>
                        <Input
                            id="used_by"
                            placeholder="Technician name or department"
                            value={formData.used_by}
                            onChange={(e) => setFormData({ ...formData, used_by: e.target.value })}
                            className="bg-slate-900 border-slate-800"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Additional information..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="bg-slate-900 border-slate-800"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {loading ? "Registering..." : "Register Withdrawal"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
