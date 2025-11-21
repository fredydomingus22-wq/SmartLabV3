'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DynamicForm } from '@/components/form-builder/DynamicForm';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

export default function ExecuteTestPage({ params }: { params: { id: string } }) {
    const [sample, setSample] = useState<any>(null);
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedTemplateId) {
            fetchTemplateDetails(selectedTemplateId);
        }
    }, [selectedTemplateId]);

    const fetchData = async () => {
        try {
            // Fetch Sample
            const { data: sampleData, error: sampleError } = await supabase
                .from('samples')
                .select('*')
                .eq('id', params.id)
                .single();

            if (sampleError) throw sampleError;
            setSample(sampleData);

            // Fetch available templates (category = 'analysis')
            const { data: templatesData, error: templatesError } = await supabase
                .from('form_templates')
                .select('id, name')
                .eq('category', 'analysis')
                .eq('active', true);

            if (templatesError) throw templatesError;
            setTemplates(templatesData || []);
        } catch (error) {
            toast.error('Error loading data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplateDetails = async (templateId: string) => {
        const { data, error } = await supabase
            .from('form_templates')
            .select(`
        *,
        fields:form_fields(*)
      `)
            .eq('id', templateId)
            .single();

        if (error) {
            toast.error('Error loading template');
        } else {
            setSelectedTemplate(data);
        }
    };

    const handleFormSubmit = async (formData: any) => {
        setSubmitting(true);
        try {
            // 1. Create Form Submission
            const { data: submission, error: submissionError } = await supabase
                .from('form_submissions')
                .insert({
                    template_id: selectedTemplateId,
                    entity_type: 'sample',
                    entity_id: sample.id,
                    data: formData,
                    status: 'submitted'
                })
                .select()
                .single();

            if (submissionError) throw submissionError;

            // 2. Create Lab Test Record
            const { error: testError } = await supabase
                .from('lab_tests')
                .insert({
                    sample_id: sample.id,
                    status: 'completed',
                    // We could link the submission ID here if we added a column for it in lab_tests, 
                    // or just rely on the entity_id in form_submissions.
                });

            if (testError) throw testError;

            // 3. Update Sample Status
            await supabase
                .from('samples')
                .update({ status: 'in_analysis' }) // or 'review'
                .eq('id', sample.id);

            toast.success('Test submitted successfully');
            router.push('/lab/samples');
        } catch (error) {
            toast.error('Error submitting test');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Execute Test</h1>
                    <p className="text-slate-500">Sample: {sample.code} ({sample.type})</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select Analysis Method</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="max-w-md">
                        <Label>Test Template</Label>
                        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a test..." />
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {selectedTemplate && (
                <Card>
                    <CardHeader>
                        <CardTitle>{selectedTemplate.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DynamicForm
                            template={selectedTemplate}
                            onSubmit={handleFormSubmit}
                            isSubmitting={submitting}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
