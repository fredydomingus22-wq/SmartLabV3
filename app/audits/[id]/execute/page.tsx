'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';

interface ChecklistItem {
    id: string;
    question: string;
    response: 'compliant' | 'non_compliant' | 'na';
    comments?: string;
}

export default function ExecuteAuditPage({ params }: { params: { id: string } }) {
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [auditInfo, setAuditInfo] = useState<{ title: string; type: string } | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        loadAuditChecklist();
    }, [params.id]);

    const loadAuditChecklist = async () => {
        try {
            setLoading(true);

            // 1. Get audit info
            const { data: audit, error: auditError } = await supabase
                .from('audits')
                .select('id, title, type, template_id')
                .eq('id', params.id)
                .single();

            if (auditError || !audit) {
                toast.error('Audit not found');
                router.push('/audits');
                return;
            }

            setAuditInfo({ title: audit.title, type: audit.type });

            // 2. Get checklist items from template or audit
            // First check if there are existing audit_checklist_items for this audit
            const { data: existingItems, error: itemsError } = await supabase
                .from('audit_checklist_items')
                .select('id, question, response, comments, order_index')
                .eq('audit_id', params.id)
                .order('order_index', { ascending: true });

            if (!itemsError && existingItems && existingItems.length > 0) {
                // Use existing checklist items
                setChecklist(existingItems.map(item => ({
                    id: item.id,
                    question: item.question,
                    response: item.response || 'na',
                    comments: item.comments || ''
                })));
            } else if (audit.template_id) {
                // Load from template if no existing items
                const { data: templateItems, error: templateError } = await supabase
                    .from('audit_template_items')
                    .select('id, question, order_index')
                    .eq('template_id', audit.template_id)
                    .order('order_index', { ascending: true });

                if (!templateError && templateItems) {
                    setChecklist(templateItems.map(item => ({
                        id: item.id,
                        question: item.question,
                        response: 'na',
                        comments: ''
                    })));
                }
            }
            // If no items found, checklist remains empty - will show empty state
        } catch (error) {
            console.error('Error loading checklist:', error);
            toast.error('Failed to load audit checklist');
        } finally {
            setLoading(false);
        }
    };

    const handleResponseChange = (id: string, value: string) => {
        setChecklist(prev => prev.map(item =>
            item.id === id ? { ...item, response: value as ChecklistItem['response'] } : item
        ));
    };

    const handleCommentChange = (id: string, value: string) => {
        setChecklist(prev => prev.map(item =>
            item.id === id ? { ...item, comments: value } : item
        ));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            // Save checklist items
            for (const item of checklist) {
                await supabase
                    .from('audit_checklist_items')
                    .upsert({
                        audit_id: params.id,
                        question: item.question,
                        response: item.response,
                        comments: item.comments
                    });
            }

            // Update audit status
            const { error } = await supabase
                .from('audits')
                .update({
                    status: 'completed',
                    score: calculateScore(),
                    completed_at: new Date().toISOString()
                })
                .eq('id', params.id);

            if (error) throw error;

            toast.success("Audit completed successfully");
            router.push('/audits');
        } catch (error) {
            console.error("Error completing audit:", error);
            toast.error("Failed to submit audit");
        } finally {
            setSubmitting(false);
        }
    };

    const calculateScore = () => {
        const compliant = checklist.filter(i => i.response === 'compliant').length;
        const total = checklist.filter(i => i.response !== 'na').length;
        return total === 0 ? 100 : Math.round((compliant / total) * 100);
    };

    if (loading) {
        return (
            <AppShell>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
                <SectionHeader
                    title="Execute Audit"
                    description={auditInfo ? `${auditInfo.title} - ${auditInfo.type}` : `Audit #${params.id}`}
                    action={
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting || checklist.length === 0}
                            >
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Complete Audit
                            </Button>
                        </div>
                    }
                />

                {checklist.length === 0 ? (
                    <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">No Checklist Items</h3>
                                <p className="text-sm text-muted-foreground max-w-md mt-2">
                                    This audit has no checklist items configured. Please add items to the audit template or contact an administrator.
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => router.push('/audits')}
                                >
                                    Back to Audits
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {checklist.map((item, index) => (
                            <Card key={item.id} className="bg-slate-900 border-slate-800">
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
                )}
            </div>
        </AppShell>
    );
}
