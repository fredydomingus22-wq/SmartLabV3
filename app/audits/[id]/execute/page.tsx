'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getAuditChecklist, createAudit } from '@/lib/queries/audits'; // createAudit is just a placeholder import
import { AuditChecklistItem } from '@/types/qms';
import { createClient } from '@/lib/supabase/client';

// Mock checklist for MVP since we don't have a template builder yet
const MOCK_CHECKLIST = [
    { id: '1', question: 'Are all employees wearing appropriate PPE?', response: 'na' },
    { id: '2', question: 'Is the production area clean and organized?', response: 'na' },
    { id: '3', question: 'Are equipment calibration logs up to date?', response: 'na' },
    { id: '4', question: 'Is raw material storage compliant with FIFO?', response: 'na' },
    { id: '5', question: 'Are waste disposal bins properly labeled?', response: 'na' },
];

export default function ExecuteAuditPage({ params }: { params: { id: string } }) {
    const [checklist, setChecklist] = useState<any[]>(MOCK_CHECKLIST);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleResponseChange = (id: string, value: string) => {
        setChecklist(prev => prev.map(item =>
            item.id === id ? { ...item, response: value } : item
        ));
    };

    const handleCommentChange = (id: string, value: string) => {
        setChecklist(prev => prev.map(item =>
            item.id === id ? { ...item, comments: value } : item
        ));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            // In a real app, we would save the checklist items to the DB
            // For now, we just update the audit status to completed

            const { error } = await supabase
                .from('audits')
                .update({
                    status: 'completed',
                    score: calculateScore(),
                    findings: JSON.stringify(checklist)
                })
                .eq('id', params.id);

            if (error) throw error;

            toast.success("Audit completed successfully");
            router.push('/audits');
        } catch (error) {
            console.error("Error completing audit:", error);
            toast.error("Failed to submit audit");
        } finally {
            setLoading(false);
        }
    };

    const calculateScore = () => {
        const compliant = checklist.filter(i => i.response === 'compliant').length;
        const total = checklist.filter(i => i.response !== 'na').length;
        return total === 0 ? 100 : Math.round((compliant / total) * 100);
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
                <SectionHeader
                    title="Execute Audit"
                    description={`Audit Execution #${params.id}`}
                    action={
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={loading}>Complete Audit</Button>
                        </div>
                    }
                />

                <div className="space-y-4">
                    {checklist.map((item, index) => (
                        <Card key={item.id}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <span className="font-medium text-lg">
                                            {index + 1}. {item.question}
                                        </span>
                                    </div>

                                    <RadioGroup
                                        value={item.response}
                                        onValueChange={(val) => handleResponseChange(item.id, val)}
                                        className="flex gap-6"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="compliant" id={`c-${item.id}`} />
                                            <Label htmlFor={`c-${item.id}`} className="text-green-600 font-medium">Compliant</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="non_compliant" id={`nc-${item.id}`} />
                                            <Label htmlFor={`nc-${item.id}`} className="text-red-600 font-medium">Non-Compliant</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="na" id={`na-${item.id}`} />
                                            <Label htmlFor={`na-${item.id}`} className="text-gray-500">N/A</Label>
                                        </div>
                                    </RadioGroup>

                                    {item.response === 'non_compliant' && (
                                        <div className="mt-2">
                                            <Label>Findings / Comments</Label>
                                            <Textarea
                                                placeholder="Describe the non-compliance..."
                                                value={item.comments || ''}
                                                onChange={(e) => handleCommentChange(item.id, e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppShell>
    );
}
