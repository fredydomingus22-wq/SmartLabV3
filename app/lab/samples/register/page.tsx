'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createSample } from '@/lib/queries/lab';
import { getProductionLots } from '@/lib/queries/production';
import { getRawMaterialLots } from '@/lib/queries/inventory';
import { ProductionLot } from '@/types/production';
import { RawMaterialLot } from '@/types/inventory';

export default function RegisterSamplePage() {
    const [loading, setLoading] = useState(false);
    const [productionLots, setProductionLots] = useState<ProductionLot[]>([]);
    const [rawMaterialLots, setRawMaterialLots] = useState<RawMaterialLot[]>([]);

    const [formData, setFormData] = useState({
        code: '',
        type: 'raw_material',
        priority: 'normal' as 'normal' | 'high' | 'urgent',
        notes: '',
        production_lot_id: '',
        raw_material_lot_id: ''
    });

    const router = useRouter();

    useEffect(() => {
        loadLots();
    }, []);

    const loadLots = async () => {
        try {
            const [prodLots, rawLots] = await Promise.all([
                getProductionLots(),
                getRawMaterialLots()
            ]);
            setProductionLots(prodLots);
            setRawMaterialLots(rawLots);
        } catch (error) {
            console.error("Error loading lots:", error);
            toast.error("Failed to load lots");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Auto-generate code if empty: SMP-YYYY-TIMESTAMP (Simple unique ID)
            const year = new Date().getFullYear();
            const code = formData.code || `SMP-${year}-${Date.now().toString().slice(-6)}`;

            await createSample({
                code,
                type: formData.type,
                priority: formData.priority,
                notes: formData.notes,
                status: 'pending',
                production_lot_id: (formData.type === 'intermediate' || formData.type === 'finished_product') ? formData.production_lot_id : undefined,
                raw_material_lot_id: (formData.type === 'raw_material') ? formData.raw_material_lot_id : undefined
            });

            toast.success('Sample registered successfully');
            router.push('/lab/samples');
        } catch (error) {
            toast.error('Failed to register sample');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Register New Sample</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Sample Code (Auto-generated if empty)</Label>
                                <Input
                                    placeholder="SMP-2024-..."
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={v => setFormData({ ...formData, priority: v as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Sample Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={v => setFormData({ ...formData, type: v, production_lot_id: '', raw_material_lot_id: '' })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="raw_material">Raw Material</SelectItem>
                                    <SelectItem value="intermediate">Intermediate Product</SelectItem>
                                    <SelectItem value="finished_product">Finished Product</SelectItem>
                                    <SelectItem value="environment">Environmental Swab</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.type === 'raw_material' && (
                            <div className="space-y-2">
                                <Label>Raw Material Lot</Label>
                                <Select
                                    value={formData.raw_material_lot_id}
                                    onValueChange={v => setFormData({ ...formData, raw_material_lot_id: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Raw Material Lot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rawMaterialLots.map(lot => (
                                            <SelectItem key={lot.id} value={lot.id}>
                                                {lot.lot_code} ({lot.raw_material?.name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {(formData.type === 'intermediate' || formData.type === 'finished_product') && (
                            <div className="space-y-2">
                                <Label>Production Lot</Label>
                                <Select
                                    value={formData.production_lot_id}
                                    onValueChange={v => setFormData({ ...formData, production_lot_id: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Production Lot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productionLots.map(lot => (
                                            <SelectItem key={lot.id} value={lot.id}>
                                                {lot.code} ({lot.product?.name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Input
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Registering...' : 'Register Sample'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
