'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { getLotsByType, getSampleTypeLotMapping, type Lot, type LotType } from '@/lib/queries/samples/getLotsByType';
import { toast } from 'sonner';

interface LotSelectorProps {
    sampleTypeCode: string;
    onSelect: (lotId: string | null, lotType: LotType | null) => void;
    selectedLotId?: string;
}

export function LotSelector({ sampleTypeCode, onSelect, selectedLotId }: LotSelectorProps) {
    const [lots, setLots] = useState<Lot[]>([]);
    const [loading, setLoading] = useState(true);
    const [lotType, setLotType] = useState<LotType | null>(null);

    useEffect(() => {
        fetchLots();
    }, [sampleTypeCode]);

    const fetchLots = async () => {
        setLoading(true);

        const mappedLotType = getSampleTypeLotMapping(sampleTypeCode);
        setLotType(mappedLotType);

        if (!mappedLotType) {
            // Sample types like 'ENV' (environmental) don't require lot selection
            setLots([]);
            setLoading(false);
            onSelect(null, null);
            return;
        }

        try {
            const data = await getLotsByType(mappedLotType);
            setLots(data);
        } catch (error) {
            console.error('Error fetching lots:', error);
            toast.error(`Failed to load ${mappedLotType} lots`);
        } finally {
            setLoading(false);
        }
    };

    if (!lotType) {
        // No lot selection needed for this sample type
        return null;
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Lot Selection</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Lot Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="lot-select">
                        Select {lotType.replace('_', ' ').toUpperCase()} Lot *
                    </Label>
                    <Select
                        value={selectedLotId || ''}
                        onValueChange={(value) => onSelect(value, lotType)}
                    >
                        <SelectTrigger id="lot-select">
                            <SelectValue placeholder="Select a lot..." />
                        </SelectTrigger>
                        <SelectContent>
                            {lots.length === 0 ? (
                                <div className="p-2 text-sm text-muted-foreground">
                                    No lots available
                                </div>
                            ) : (
                                lots.map((lot) => (
                                    <SelectItem key={lot.id} value={lot.id}>
                                        {lot.code}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
