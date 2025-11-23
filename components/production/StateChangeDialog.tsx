"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { IntermediateLot } from "@/types/production";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface StateChangeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lot: IntermediateLot | null;
    onSuccess: () => void;
}

export function StateChangeDialog({
    open,
    onOpenChange,
    lot,
    onSuccess
}: StateChangeDialogProps) {
    const [loading, setLoading] = useState(false);
    const [newStatus, setNewStatus] = useState<IntermediateLot['status'] | ''>('');

    if (!lot) return null;

    const availableStatuses: { value: IntermediateLot['status']; label: string }[] = [
        { value: 'em_producao', label: 'Em Produção' },
        { value: 'terminado', label: 'Terminado' },
        { value: 'consumido', label: 'Consumido' },
    ];

    // Filter valid next states
    const validNextStates = availableStatuses.filter(s => {
        if (lot.status === 'em_producao') return s.value === 'terminado';
        if (lot.status === 'terminado') return s.value === 'consumido';
        return false;
    });

    const handleSave = async () => {
        if (!newStatus) return;
        setLoading(true);
        const supabase = createClient();

        try {
            const updates: any = { status: newStatus };
            const now = new Date().toISOString();

            if (newStatus === 'terminado') {
                updates.completed_at = now;
            } else if (newStatus === 'consumido') {
                updates.consumed_at = now;
            }

            const { error } = await supabase
                .from('intermediate_lots')
                .update(updates)
                .eq('id', lot.id);

            if (error) throw error;

            toast.success(`Status updated to ${availableStatuses.find(s => s.value === newStatus)?.label}`);
            onSuccess();
            onOpenChange(false);
            setNewStatus('');

        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Change Lot Status</DialogTitle>
                    <DialogDescription>
                        Update the lifecycle status for Lot {lot.code}.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Current Status</Label>
                        <div className="font-medium capitalize text-muted-foreground">
                            {lot?.status?.replace('_', ' ')}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">New Status</Label>
                        <Select
                            value={newStatus}
                            onValueChange={(val) => setNewStatus(val as IntermediateLot['status'])}
                        >
                            <SelectTrigger id="status" className="bg-slate-900 border-slate-800">
                                <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                            <SelectContent>
                                {validNextStates.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {newStatus === 'consumido' && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 flex items-start gap-3 text-yellow-500 text-sm">
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>
                                Marking as "Consumido" indicates this lot has been fully used or processed.
                                This action is generally irreversible.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!newStatus || loading} className="bg-primary">
                        {loading ? "Updating..." : "Update Status"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
