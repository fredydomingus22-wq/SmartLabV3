"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormBuilderCanvas } from "@/components/form-builder/FormBuilderCanvas";
import { FieldPalette } from "@/components/form-builder/FieldPalette";
import { FieldConfigPanel } from "@/components/form-builder/FieldConfigPanel";
import {
    getFormTemplateById,
    createFormField,
    updateFormField,
    deleteFormField,
    updateFormTemplate
} from "@/lib/queries/form-builder";
import type { FormTemplateWithFields, FormField, FieldType, FormModule, FormCategory } from "@/types/form-builder";
import { Loader } from "@/components/ui/Loader";
import { Save, Eye, ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function FormBuilderEditorPage() {
    const params = useParams();
    const router = useRouter();
    const templateId = params.id as string;

    const [template, setTemplate] = useState<FormTemplateWithFields | null>(null);
    const [selectedField, setSelectedField] = useState<FormField | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        loadTemplate();
    }, [templateId]);

    const handleUpdateTemplateSettings = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!template) return;
        setSaving(true);

        const formData = new FormData(e.currentTarget);
        const updates = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as FormCategory,
            target_module: formData.get('target_module') as FormModule,
        };

        try {
            const { data, error } = await updateFormTemplate(template.id, updates);
            if (error) throw error;

            setTemplate(prev => prev ? { ...prev, ...updates } : null);
            setSettingsOpen(false);
        } catch (error) {
            console.error('Error updating template:', error);
            alert('Failed to update template settings');
        } finally {
            setSaving(false);
        }
    };

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

    const handleAddField = async (fieldType: FieldType) => {
        if (!template) return;

        const newField: Partial<FormField> = {
            template_id: templateId,
            field_type: fieldType,
            field_key: `field_${Date.now()}`,
            label: `New ${fieldType} Field`,
            is_required: false,
            validation_rules: [],
            conditional_logic: {},
            options: [],
            order_index: (template.fields?.length || 0) + 1,
        };

        try {
            const { data, error } = await createFormField(newField);
            if (error) throw error;

            // Reload template to get updated fields
            await loadTemplate();
            if (data) setSelectedField(data);
        } catch (error) {
            console.error('Error adding field:', error);
            alert('Failed to add field');
        }
    };

    const handleUpdateField = async (field: Partial<FormField>) => {
        if (!selectedField) return;

        try {
            const { data, error } = await updateFormField(selectedField.id, field);
            if (error) throw error;

            await loadTemplate();
            if (data) setSelectedField(data);
        } catch (error) {
            console.error('Error updating field:', error);
            alert('Failed to update field');
        }
    };

    const handleDeleteField = async (fieldId: string) => {
        if (!confirm('Are you sure you want to delete this field?')) return;

        try {
            const { error } = await deleteFormField(fieldId);
            if (error) throw error;

            setSelectedField(null);
            await loadTemplate();
        } catch (error) {
            console.error('Error deleting field:', error);
            alert('Failed to delete field');
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
                            <Button onClick={() => router.push('/form-builder')}>
                                Back to Form Builder
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="h-screen flex flex-col">
                {/* Header */}
                <div className="border-b p-4 bg-card">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/form-builder">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold">{template.name}</h1>
                                <p className="text-sm text-muted-foreground">{template.description}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Template Settings</DialogTitle>
                                        <DialogDescription>
                                            Update the basic information for this form template.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleUpdateTemplateSettings} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input id="name" name="name" defaultValue={template.name} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea id="description" name="description" defaultValue={template.description} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="category">Category</Label>
                                                <Select name="category" defaultValue={template.category}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="analysis">Analysis</SelectItem>
                                                        <SelectItem value="inspection">Inspection</SelectItem>
                                                        <SelectItem value="checklist">Checklist</SelectItem>
                                                        <SelectItem value="monitoring">Monitoring</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="target_module">Target Module</Label>
                                                <Select name="target_module" defaultValue={template.target_module || 'general'}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="general">General / All</SelectItem>
                                                        <SelectItem value="production-lots">Production Lots</SelectItem>
                                                        <SelectItem value="intermediate-lots">Intermediate Lots</SelectItem>
                                                        <SelectItem value="finished-lots">Finished Lots</SelectItem>
                                                        <SelectItem value="raw-materials">Raw Materials</SelectItem>
                                                        <SelectItem value="raw-material-lots">Raw Material Lots</SelectItem>
                                                        <SelectItem value="lab-tests">Lab Tests</SelectItem>
                                                        <SelectItem value="audits">Audits</SelectItem>
                                                        <SelectItem value="food-safety">Food Safety</SelectItem>
                                                        <SelectItem value="traceability">Traceability</SelectItem>
                                                        <SelectItem value="suppliers">Suppliers</SelectItem>
                                                        <SelectItem value="trainings">Trainings</SelectItem>
                                                        <SelectItem value="documents">Documents</SelectItem>
                                                        <SelectItem value="nc">Non-Conformance</SelectItem>
                                                        <SelectItem value="spc">SPC</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setSettingsOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={saving}>
                                                {saving ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                            </Button>
                            <Button size="sm" disabled>
                                <Save className="mr-2 h-4 w-4" />
                                Auto-saved
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Editor */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel - Field Palette */}
                    <div className="w-64 border-r p-4 overflow-y-auto bg-card">
                        <FieldPalette onAddField={handleAddField} />
                    </div>

                    {/* Center - Canvas */}
                    <div className="flex-1 p-6 overflow-y-auto bg-muted/30">
                        <FormBuilderCanvas
                            fields={template.fields || []}
                            onSelectField={setSelectedField}
                            selectedField={selectedField}
                            onDeleteField={handleDeleteField}
                            onAddField={handleAddField}
                        />
                    </div>

                    {/* Right Panel - Field Configuration */}
                    <div className="w-80 border-l p-4 overflow-y-auto bg-card">
                        <FieldConfigPanel
                            field={selectedField}
                            onClose={() => setSelectedField(null)}
                            onUpdate={handleUpdateField}
                        />
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
