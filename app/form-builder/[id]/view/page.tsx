"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DynamicForm } from "@/components/form-builder/DynamicForm";
import { getFormTemplateById, createFormSubmission } from "@/lib/queries/form-builder";
import type { FormTemplateWithFields } from "@/types/form-builder";
import { Loader } from "@/components/ui/Loader";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FormViewerPage() {
    const params = useParams();
    const router = useRouter();
    const templateId = params.id as string;

    const [template, setTemplate] = useState<FormTemplateWithFields | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadTemplate();
    }, [templateId]);

    const loadTemplate = async () => {
        setLoading(true);
        try {
            const { data, error } = await getFormTemplateById(templateId);
            if (error) throw error;
            setTemplate(data);
        } catch (error) {
            console.error('Error loading template:', error);
            alert('Failed to load form template');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData: Record<string, any>) => {
        if (!template) return;

        setSubmitting(true);
        try {
            const { error } = await createFormSubmission({
                template_id: template.id,
                data: formData,
                status: 'submitted',
                submitted_by: 'user-id-placeholder', // TODO: Get actual user ID
                entity_type: 'test_submission'
            });

            if (error) throw error;

            alert('Form submitted successfully!');
            router.push('/form-builder');
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Failed to submit form');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <AppShell>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader />
                </div>
            </AppShell>
        );
    }

    if (!template) {
        return (
            <AppShell>
                <div className="p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Not Found</CardTitle>
                            <CardDescription>The form template could not be loaded.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/form-builder">
                                <Button>Back to Form Builder</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="max-w-3xl mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/form-builder">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DynamicForm
                            template={template}
                            onSubmit={handleSubmit}
                            isSubmitting={submitting}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
