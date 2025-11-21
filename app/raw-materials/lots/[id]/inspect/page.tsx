'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UploadCloud } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';

export default function InspectLotPage({ params }: { params: { id: string } }) {
    const [lot, setLot] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [checklist, setChecklist] = useState({
        visual_check: false,
        packaging_integrity: false,
        labeling_check: false,
        temperature_check: '',
        notes: ''
    });

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        fetchLot();
    }, []);

    const fetchLot = async () => {
        const { data, error } = await supabase
            .from('raw_material_lots')
            .select('*, raw_materials(name)')
            .eq('id', params.id)
            .single();

        if (error) {
            toast.error('Error loading lot');
            return;
        }
        setLot(data);
        setLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `coa/${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { error: updateError } = await supabase
                .from('raw_material_lots')
                .update({ coa_url: filePath })
                .eq('id', params.id);

            if (updateError) throw updateError;

            toast.success('COA uploaded successfully');
            fetchLot();
        } catch (error) {
            toast.error('Error uploading COA');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmitInspection = async () => {
        try {
            // In a real scenario, we would create a form_submission entry.
            // For this MVP step, we'll just update the status and save inspection data in a JSON column or similar if we had one,
            // but since we defined inspection_submission_id, let's simulate creating a submission or just approve the lot directly for now.

            // Simplified logic: Update status to 'approved' or 'rejected'
            const status = checklist.visual_check && checklist.packaging_integrity ? 'approved' : 'rejected';

            const { error } = await supabase
                .from('raw_material_lots')
                .update({
                    status: status,
                    // In a real app, store the checklist data properly
                })
                .eq('id', params.id);

            if (error) throw error;

            toast.success(`Lot ${status}`);
            router.push('/raw-materials/lots');
        } catch (error) {
            toast.error('Error submitting inspection');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Inspect Lot: {lot.lot_code}</h1>
                <span className={`px-3 py-1 rounded-full text-sm ${lot.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {lot.status}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Material Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Material</Label>
                            <div className="text-lg font-medium">{lot.raw_materials?.name}</div>
                        </div>
                        <div>
                            <Label>Received Date</Label>
                            <div>{lot.received_date || 'N/A'}</div>
                        </div>

                        <div className="pt-4 border-t">
                            <Label className="mb-2 block">Certificate of Analysis (COA)</Label>
                            {lot.coa_url ? (
                                <div className="flex items-center gap-2 mt-2 p-3 bg-green-50 border border-green-100 rounded-md text-green-700">
                                    <UploadCloud className="w-4 h-4" />
                                    <span className="font-medium">COA Uploaded</span>
                                    <span className="text-xs text-green-600 ml-auto truncate max-w-[150px]">{lot.coa_url}</span>
                                </div>
                            ) : (
                                <FileUpload
                                    bucket="documents"
                                    path="coa"
                                    label="Upload COA (PDF/Image)"
                                    onUploadComplete={async (path) => {
                                        const { error } = await supabase
                                            .from('raw_material_lots')
                                            .update({ coa_url: path })
                                            .eq('id', params.id);

                                        if (error) {
                                            toast.error('Failed to link COA to lot');
                                        } else {
                                            toast.success('COA linked successfully');
                                            fetchLot();
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Inspection Checklist</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="visual"
                                className="w-4 h-4"
                                checked={checklist.visual_check}
                                onChange={e => setChecklist({ ...checklist, visual_check: e.target.checked })}
                            />
                            <Label htmlFor="visual">Visual Inspection Passed</Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="packaging"
                                className="w-4 h-4"
                                checked={checklist.packaging_integrity}
                                onChange={e => setChecklist({ ...checklist, packaging_integrity: e.target.checked })}
                            />
                            <Label htmlFor="packaging">Packaging Integrity OK</Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="labeling"
                                className="w-4 h-4"
                                checked={checklist.labeling_check}
                                onChange={e => setChecklist({ ...checklist, labeling_check: e.target.checked })}
                            />
                            <Label htmlFor="labeling">Labeling Correct</Label>
                        </div>

                        <div>
                            <Label>Temperature (°C)</Label>
                            <Input
                                type="number"
                                value={checklist.temperature_check}
                                onChange={e => setChecklist({ ...checklist, temperature_check: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label>Notes</Label>
                            <Input
                                value={checklist.notes}
                                onChange={e => setChecklist({ ...checklist, notes: e.target.value })}
                            />
                        </div>

                        <Button className="w-full mt-4" onClick={handleSubmitInspection}>
                            Submit Inspection
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
