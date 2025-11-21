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
import type { FormCategory } from "@/types/form-builder";

export default function CreateFormTemplatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "analysis" as FormCategory
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
