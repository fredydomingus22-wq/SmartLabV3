"use client"

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { deleteFormTemplate, getFormTemplates } from "@/lib/queries/form-builder";
import type { FormTemplate, FormCategory, FormModule } from "@/types/form-builder";
import { Loader } from "@/components/ui/Loader";
import { Plus, Edit, Trash2, FileText, Eye } from "lucide-react";
import Link from "next/link";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function FormBuilderPage() {
    const [templates, setTemplates] = useState<FormTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<FormCategory | "all">("all");
    const [moduleFilter, setModuleFilter] = useState<FormModule | "all">("all");

    const moduleOptions = useMemo(
        () => [
            { value: "general", label: "General / All" },
            { value: "production-lots", label: "Production Lots" },
            { value: "intermediate-lots", label: "Intermediate Lots" },
            { value: "finished-lots", label: "Finished Lots" },
            { value: "raw-materials", label: "Raw Materials" },
            { value: "raw-material-lots", label: "Raw Material Lots" },
            { value: "lab-tests", label: "Lab Tests" },
            { value: "audits", label: "Audits" },
            { value: "food-safety", label: "Food Safety" },
            { value: "traceability", label: "Traceability" },
            { value: "suppliers", label: "Suppliers" },
            { value: "trainings", label: "Trainings" },
            { value: "documents", label: "Documents" },
            { value: "nc", label: "Non-Conformance" },
            { value: "spc", label: "SPC" },
        ],
        []
    );

    const loadTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await getFormTemplates(
                categoryFilter === "all" ? undefined : categoryFilter,
                moduleFilter === "all" ? undefined : moduleFilter
            );
            if (error) throw error;
            setTemplates(data || []);
        } catch (error) {
            console.error('Error loading templates:', error);
        } finally {
            setLoading(false);
        }
    }, [categoryFilter, moduleFilter]);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    const getCategoryBadgeColor = (category: string) => {
        const colors: Record<string, string> = {
            analysis: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            inspection: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            checklist: 'bg-green-500/10 text-green-500 border-green-500/20',
            monitoring: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        };
        return colors[category] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm('Tem certeza que deseja apagar este template?')) return;
        setDeletingId(id);
        try {
            const { error } = await deleteFormTemplate(id);
            if (error) throw error;
            setTemplates((prev) => prev.filter((t) => t.id !== id));
        } catch (error) {
            console.error('Error deleting template:', error);
            alert('Failed to delete template');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Form Builder"
                    description="Create and manage dynamic forms for analyses, inspections, and checklists"
                    action={
                        <Link href="/form-builder/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Form Template
                            </Button>
                        </Link>
                    }
                />

                <Card>
                    <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-4">
                        <div className="flex gap-3 flex-1 flex-wrap">
                            <Select
                                value={categoryFilter}
                                onValueChange={(value) => setCategoryFilter(value as FormCategory | "all")}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All categories</SelectItem>
                                    <SelectItem value="analysis">Analysis</SelectItem>
                                    <SelectItem value="inspection">Inspection</SelectItem>
                                    <SelectItem value="checklist">Checklist</SelectItem>
                                    <SelectItem value="monitoring">Monitoring</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={moduleFilter}
                                onValueChange={(value) => setModuleFilter(value as FormModule | "all")}
                            >
                                <SelectTrigger className="w-[220px]">
                                    <SelectValue placeholder="Filter by module" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All modules</SelectItem>
                                    {moduleOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            {templates.length} templates
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader />
                    </div>
                ) : templates.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No form templates yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Create your first form template to get started
                            </p>
                            <Link href="/form-builder/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Template
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {templates.map((template) => (
                            <Card key={template.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{template.name}</CardTitle>
                                            <CardDescription className="mt-1.5">
                                                {template.description || 'No description'}
                                            </CardDescription>
                                        </div>
                                        {template.active && (
                                            <span className="flex h-2 w-2 relative">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {/* Category Badge */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-xs px-2 py-1 rounded-md border font-medium capitalize ${getCategoryBadgeColor(template.category)}`}>
                                                {template.category}
                                            </span>
                                            {template.target_module && template.target_module !== 'general' && (
                                                <span className="text-xs px-2 py-1 rounded-md border font-medium bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 capitalize">
                                                    {template.target_module.replace('-', ' ')}
                                                </span>
                                            )}
                                            <span className="text-xs text-muted-foreground ml-auto">
                                                {template.created_at ? new Date(template.created_at).toLocaleDateString() : ''}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2">
                                            <Link href={`/form-builder/${template.id}/view`} className="flex-1">
                                                <Button variant="secondary" className="w-full" size="sm">
                                                    <Eye className="mr-2 h-3.5 w-3.5" />
                                                    View
                                                </Button>
                                            </Link>
                                            <Link href={`/form-builder/${template.id}/edit`}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDeleteTemplate(template.id)}
                                                disabled={deletingId === template.id}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
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
