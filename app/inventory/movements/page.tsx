'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getRawMaterialLots, updateRawMaterialLotQuantity } from '@/lib/queries/inventory';
import { RawMaterialLot } from '@/types/inventory';

export default function StockMovementPage() {
    const [lots, setLots] = useState<RawMaterialLot[]>([]);
    const [selectedLotId, setSelectedLotId] = useState('');
    const [quantityChange, setQuantityChange] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadLots();
    }, []);

    const loadLots = async () => {
        const data = await getRawMaterialLots();
        setLots(data);
    };

    const handleSubmit = async () => {
        if (!selectedLotId || !quantityChange) {
            toast.error("Please select a lot and enter quantity");
            return;
        }

        const lot = lots.find(l => l.id === selectedLotId);
        if (!lot) return;

        const currentQty = lot.quantity || 0;
        const change = parseFloat(quantityChange);
        const newQty = currentQty + change;

        if (newQty < 0) {
            toast.error("Insufficient stock for this operation");
            return;
        }

        try {
            setLoading(true);
            await updateRawMaterialLotQuantity(selectedLotId, newQty);
            toast.success("Stock updated successfully");
            router.push('/inventory');
        } catch (error) {
            console.error("Error updating stock:", error);
            toast.error("Failed to update stock");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6 max-w-2xl mx-auto">
                <SectionHeader
                    title="Register Stock Movement"
                    description="Record incoming or outgoing stock adjustments."
                    action={
                        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Movement Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Select Lot</Label>
                            <Select value={selectedLotId} onValueChange={setSelectedLotId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a lot..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {lots.map(lot => (
                                        <SelectItem key={lot.id} value={lot.id}>
                                            {lot.lot_code} - {lot.raw_material?.name} (Current: {lot.quantity} {lot.unit})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Quantity Change (+ for In, - for Out)</Label>
                            <Input
                                type="number"
                                value={quantityChange}
                                onChange={e => setQuantityChange(e.target.value)}
                                placeholder="e.g. 10 or -5"
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter a positive number to add stock, negative to remove.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Input
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="e.g. Production usage, New shipment, Adjustment"
                            />
                        </div>

                        <Button onClick={handleSubmit} disabled={loading} className="w-full">
                            Confirm Movement
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
