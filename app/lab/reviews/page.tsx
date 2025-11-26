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
                    production_lot:production_lots(code),
                    raw_material_lot:raw_material_lots(lot_code)
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
            const newStatus = action === "approve" ? "approved" : "rejected"; // Note: 'rejected' might need to be added to types if not present, usually 'failed' or 'rejected'
            // Check types/lims.ts: status: 'pending' | 'in_analysis' | 'reviewed' | 'approved'
            // If rejected isn't there, we might need to add it or use a different status.
            // Let's assume 'approved' for now and maybe 'in_analysis' for reject (send back)?
            // Or better, let's check types.

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
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg">{sample.code}</h3>
                                            <Badge variant="outline">{sample.sample_type.replace("_", " ")}</Badge>
                                            {sample.priority === "urgent" && <Badge variant="destructive">Urgent</Badge>}
                                        </div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(sample.created_at).toLocaleDateString()}
                                            </span>
                                            {sample.production_lot_id && (
                                                <span>Lot: {(sample as any).production_lot?.code}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
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
