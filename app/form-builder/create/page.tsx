"use client"

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFormTemplate } from "@/lib/queries/form-builder";
import type { FormCategory, FormModule } from "@/types/form-builder";

export default function CreateFormTemplatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "analysis" as FormCategory,
        target_module: "general" as FormModule
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await createFormTemplate({
                ...formData,
                active: true
            });

            if (error) throw error;

            if (data) {
                router.push(`/form-builder/${data.id}/edit`);
            }
        } catch (error) {
            console.error('Error creating template:', error);
            alert('Failed to create form template');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppShell>
            <div className="p-6">
                <SectionHeader
                    title="Create Form Template"
                    description="Set up a new dynamic form template"
                />

                <form onSubmit={handleSubmit} className="mt-6 max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Template Details</CardTitle>
                            <CardDescription>
                                Provide basic information about this form template
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Template Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Análise Produto Final"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value as FormCategory })}
                                >
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
                                <Select
                                    value={formData.target_module}
                                    onValueChange={(value) => setFormData({ ...formData, target_module: value as FormModule })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a module (optional)" />
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

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the purpose of this form..."
                                    rows={4}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" disabled={loading || !formData.name}>
                                    {loading ? 'Creating...' : 'Create Template'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppShell>
    );
}
