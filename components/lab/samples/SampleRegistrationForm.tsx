'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SampleTypeSelector } from './SampleTypeSelector';
import { LotSelector } from './LotSelector';
import { CollectionDetailsCard } from './CollectionDetailsCard';
import { createSample } from '@/lib/actions/samples/createSample';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useServerAction } from '@/lib/hooks/useServerAction';
import type { SampleType } from '@/lib/queries/samples/getSampleTypes';
import type { LotType } from '@/lib/queries/samples/getLotsByType';

export function SampleRegistrationForm() {
    const router = useRouter();

    // Sample Type Selection
    const [selectedSampleType, setSelectedSampleType] = useState<SampleType | null>(null);

    // Lot Selection
    const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
    const [selectedLotType, setSelectedLotType] = useState<LotType | null>(null);

    // Collection Details
    const [collectionPoint, setCollectionPoint] = useState('');
    const [collectedBy, setCollectedBy] = useState('');
    const [collectedAt, setCollectedAt] = useState(
        new Date().toISOString().slice(0, 16) // Format for datetime-local input
    );
    const [notes, setNotes] = useState('');
    const [productId, setProductId] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    const handleSampleTypeSelect = (sampleType: SampleType) => {
        setSelectedSampleType(sampleType);
        // Reset lot selection when sample type changes
        setSelectedLotId(null);
        setSelectedLotType(null);
    };

    const handleLotSelect = (lotId: string | null, lotType: LotType | null) => {
        setSelectedLotId(lotId);
        setSelectedLotType(lotType);
    };

    const { execute, loading: submitting } = useServerAction(
        createSample,
        {
            successMessage: 'Sample registered successfully',
            onSuccess: (result) => {
                if (result?.id) {
                    router.push(`/lab/samples/${result.id}`);
                }
            }
        }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSampleType) {
            toast.error('Please select a sample type');
            return;
        }

        if (!collectionPoint || !collectedBy) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Prepare data payload
        const payload: any = {
            sample_type_id: selectedSampleType.id,
            product_id: productId || undefined,
            collection_point: collectionPoint,
            collected_by: collectedBy,
            collected_at: new Date(collectedAt).toISOString(),
            notes: notes || undefined,
            assigned_to: assignedTo || undefined
        };

        // Add the selected lot based on type
        if (selectedLotId && selectedLotType) {
            payload[`${selectedLotType}_id`] = selectedLotId;
        }

        await execute(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Sample Type Selection */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Step 1: Select Sample Type</h3>
                <SampleTypeSelector
                    onSelect={handleSampleTypeSelect}
                    selectedId={selectedSampleType?.id}
                />
            </div>

            {/* Step 2: Lot Selection (Conditional) */}
            {selectedSampleType && (
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Step 2: Select Lot (if applicable)</h3>
                    <LotSelector
                        sampleTypeCode={selectedSampleType.code}
                        onSelect={handleLotSelect}
                        selectedLotId={selectedLotId || undefined}
                    />
                </div>
            )}

            {/* Step 3: Collection Details */}
            {selectedSampleType && (
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Step 3: Collection Details</h3>
                    <CollectionDetailsCard
                        collectionPoint={collectionPoint}
                        collectedBy={collectedBy}
                        collectedAt={collectedAt}
                        notes={notes}
                        productId={productId}
                        assignedTo={assignedTo}
                        onCollectionPointChange={setCollectionPoint}
                        onCollectedByChange={setCollectedBy}
                        onCollectedAtChange={setCollectedAt}
                        onNotesChange={setNotes}
                        onProductIdChange={setProductId}
                        onAssignedToChange={setAssignedTo}
                    />
                </div>
            )}

            {/* Submit Button */}
            {selectedSampleType && (
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registering...
                            </>
                        ) : (
                            'Register Sample'
                        )}
                    </Button>
                </div>
            )}
        </form>
    );
}
