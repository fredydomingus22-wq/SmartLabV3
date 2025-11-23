"use client";

import { useState, useEffect } from "react";
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
import { ArrowDownToLine, Calendar } from "lucide-react";
import { getReagents } from "@/lib/queries/reagents";

interface ReagentEntryFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reagent: ReagentWithStock | null;
    onSuccess?: () => void;
}

export function ReagentEntryForm({ open, onOpenChange, reagent, onSuccess }: ReagentEntryFormProps) {
    const [loading, setLoading] = useState(false);
    const [reagents, setReagents] = useState<ReagentWithStock[]>([]);
    const [selectedReagentId, setSelectedReagentId] = useState<string>("");
    const [formData, setFormData] = useState({
        quantity: "",
        batch_number: "",
        supplier: "",
        expiry_date: "",
        cost_per_unit: "",
        notes: "",
    });

    // Fetch reagents if no reagent is pre-selected
    useEffect(() => {
        if (open && !reagent) {
            fetchReagents();
        }
        if (reagent) {
            setSelectedReagentId(reagent.id);
        }
    }, [open, reagent]);

    const fetchReagents = async () => {
        try {
            const data = await getReagents();
            setReagents(data);
        } catch (error) {
            console.error("Error fetching reagents:", error);
            toast.error("Failed to load reagents");
        }
    };

    const selectedReagent = reagent || reagents.find(r => r.id === selectedReagentId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReagent) {
            toast.error("Please select a reagent");
            return;
        }

        setLoading(true);
        try {
            // Create stock movement entry
            const response = await fetch("/api/reagents/movements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reagent_id: selectedReagent.id,
                    movement_type: "entry",
                    quantity: parseFloat(formData.quantity),
                    batch_number: formData.batch_number,
                    supplier: formData.supplier,
                    expiry_date: formData.expiry_date || null,
                    cost_per_unit: formData.cost_per_unit ? parseFloat(formData.cost_per_unit) : null,
                    notes: formData.notes,
                }),
            });

            if (!response.ok) throw new Error("Failed to register entry");

            toast.success(`Entry registered: +${formData.quantity} ${selectedReagent.unit}`);

            // Reset form
            setFormData({
                quantity: "",
                batch_number: "",
                supplier: "",
                expiry_date: "",
                cost_per_unit: "",
                notes: "",
            });

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error("Error registering entry:", error);
            toast.error("Failed to register entry");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowDownToLine className="w-5 h-5 text-green-500" />
                        Register Entry {selectedReagent ? `- ${selectedReagent.name}` : ""}
                    </DialogTitle>
                    <DialogDescription>
                        {selectedReagent
                            ? `Add stock to the inventory. Current: ${selectedReagent.stock_current} ${selectedReagent.unit}`
                            : "Select a reagent and add stock to the inventory"
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Reagent Selection - only show if no reagent pre-selected */}
                    {!reagent && (
                        <div className="space-y-2">
                            <Label htmlFor="reagent">Reagent *</Label>
                            <Select
                                value={selectedReagentId}
                                onValueChange={setSelectedReagentId}
                                required
                            >
                                <SelectTrigger className="bg-slate-900 border-slate-800">
                                    <SelectValue placeholder="Select reagent" />
                                </SelectTrigger>
                                <SelectContent>
                                    {reagents.map((r) => (
                                        <SelectItem key={r.id} value={r.id}>
                                            {r.code} - {r.name} ({r.stock_current} {r.unit})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity *</Label>
                            <Input
                                id="quantity"
                                type="number"
                                step="0.01"
                                placeholder={selectedReagent ? `Amount in ${selectedReagent.unit}` : "Amount"}
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                required
                                className="bg-slate-900 border-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="batch_number">Batch Number *</Label>
                            <Input
                                id="batch_number"
                                placeholder="e.g., BATCH-2024-001"
                                value={formData.batch_number}
                                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                                required
                                className="bg-slate-900 border-slate-800"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="supplier">Supplier</Label>
                            <Input
                                id="supplier"
                                placeholder="Supplier name"
                                value={formData.supplier}
                                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                className="bg-slate-900 border-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expiry_date" className="flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                Expiry Date
                            </Label>
                            <Input
                                id="expiry_date"
                                type="date"
                                value={formData.expiry_date}
                                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                className="bg-slate-900 border-slate-800"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cost_per_unit">Cost per Unit {selectedReagent ? `(${selectedReagent.unit})` : ""}</Label>
                        <Input
                            id="cost_per_unit"
                            type="number"
                            step="0.01"
                            placeholder="e.g., 25.50"
                            value={formData.cost_per_unit}
                            onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
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
                        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                            {loading ? "Registering..." : "Register Entry"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
