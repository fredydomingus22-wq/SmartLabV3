"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/Loader";
import { getFormTemplates, getFormSubmissionsByEntity } from "@/lib/queries/form-builder";
import type { FormTemplate, FormSubmission } from "@/types/form-builder";
import { Plus, FileText, Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function EntityFormsPage() {
    const params = useParams();
    const router = useRouter();
    const entityType = params.entityType as string;
    const entityId = params.entityId as string;

    const [templates, setTemplates] = useState<FormTemplate[]>([]);
    const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [entityType, entityId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [templatesRes, submissionsRes] = await Promise.all([
                getFormTemplates(),
                getFormSubmissionsByEntity(entityType, entityId)
            ]);

            if (templatesRes.error) throw templatesRes.error;
            if (submissionsRes.error) throw submissionsRes.error;

            // Filter active templates
            setTemplates(templatesRes.data?.filter(t => t.active) || []);
            setSubmissions(submissionsRes.data || []);
        } catch (error) {
            console.error('Error loading form data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEntityTitle = () => {
        switch (entityType) {
            case 'production_lot': return 'Production Lot Inspections';
            case 'lab_test': return 'Lab Test Results';
            case 'raw_material': return 'Raw Material Checks';
            default: return `${entityType.replace('_', ' ')} Forms`;
        }
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </div>

                <SectionHeader
                    title={getEntityTitle()}
                    description={`Manage forms and inspections for ID: ${entityId}`}
                />

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader />
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Available Forms */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Start New Form
                            </h3>
                            <div className="grid gap-4">
                                {templates.map((template) => (
                                    <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => router.push(`/shared/forms/${entityType}/${entityId}/${template.id}`)}>
                                        <CardHeader className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-base">{template.name}</CardTitle>
                                                    <CardDescription className="text-xs mt-1">{template.description}</CardDescription>
                                                </div>
                                                <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground capitalize">
                                                    {template.category}
                                                </span>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Past Submissions */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                History
                            </h3>
                            {submissions.length === 0 ? (
                                <Card>
                                    <CardContent className="py-8 text-center text-muted-foreground text-sm">
                                        No forms submitted yet.
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid gap-3">
                                    {submissions.map((submission) => (
                                        <Card key={submission.id} className="hover:bg-muted/50 transition-colors">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="font-medium text-sm">
                                                        {/* We would ideally join with template name here, for now showing ID or generic */}
                                                        Form Submission
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(submission.submitted_at).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {submission.submitted_by}
                                                        </span>
                                                    </div>
                                                </div>
                                                <StatusBadge status={submission.status} />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
