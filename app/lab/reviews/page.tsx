"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FileText, Clock } from "lucide-react";
import { toast } from "sonner";
import { updateSampleStatus } from "@/lib/queries/lab";
import { Sample } from "@/types/lims";

export default function ReviewSamplesPage() {
    const [samples, setSamples] = useState<Sample[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchPendingReviews();
    }, []);

    const fetchPendingReviews = async () => {
        try {
            const { data, error } = await supabase
                .from("samples")
                .select(`
                    *,
                    sample_types:sample_types(code, name)
                `)
                .eq("status", "reviewed")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setSamples(data as Sample[]);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            toast.error("Failed to load pending reviews");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: "approve" | "reject") => {
        if (!confirm(`Are you sure you want to ${action.toUpperCase()} this sample?`)) return;

        try {
            const newStatus = action === "approve" ? "approved" : "rejected";
            await updateSampleStatus(id, newStatus as any);
            toast.success(`Sample ${action}d successfully`);
            fetchPendingReviews();
        } catch (error) {
            console.error(`Error ${action}ing sample:`, error);
            toast.error(`Failed to ${action} sample`);
        }
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="QA Review"
                    description="Review and approve samples pending validation"
                />

                {loading ? (
                    <div>Loading reviews...</div>
                ) : samples.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                        <p>All caught up! No samples pending review.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {samples.map((sample) => (
                            <Card key={sample.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{sample.code}</CardTitle>
                                            <div className="flex gap-2 mt-2 text-sm text-muted-foreground">
                                                <span>{(sample as any).sample_types?.name}</span>
                                                {sample.production_lot_id && (
                                                    <span>Lot: {(sample as any).production_lot?.code}</span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge variant="secondary">
                                            <Clock className="mr-1 h-3 w-3" />
                                            Pending Review
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="outline" size="sm">
                                            <FileText className="mr-2 h-4 w-4" />
                                            View Results
                                        </Button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => handleAction(sample.id, "approve")}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Approve
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleAction(sample.id, "reject")}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Reject
                                        </Button>
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
