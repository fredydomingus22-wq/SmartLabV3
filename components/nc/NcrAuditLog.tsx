'use client';

import { useState } from "react";
import { NcAuditLog } from "@/lib/ncService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from "lucide-react";

interface NcrAuditLogProps {
    logs?: NcAuditLog[];
    onAddComment?: (comment: string) => Promise<void> | void;
}

export function NcrAuditLog({ logs = [], onAddComment }: NcrAuditLogProps) {
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!comment.trim()) return;
        try {
            setSubmitting(true);
            await onAddComment?.(comment.trim());
            setComment("");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="bg-slate-900/70 border-slate-800 shadow-lg backdrop-blur">
            <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-slate-50">Audit Trail & Comments</CardTitle>
                <Badge variant="outline" className="border-slate-700 text-slate-200">
                    <MessageSquare size={14} className="mr-1" /> {logs.length} entries
                </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="max-h-64 overflow-y-auto space-y-2">
                    {logs.map((log) => (
                        <div
                            key={log.id}
                            className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 flex items-start justify-between gap-3"
                        >
                            <div>
                                <div className="text-slate-100 font-medium">{log.action}</div>
                                {log.details && (
                                    <div className="text-xs text-slate-400">
                                        {JSON.stringify(log.details)}
                                    </div>
                                )}
                                <div className="text-xs text-slate-500">
                                    {log.performed_at ? new Date(log.performed_at).toLocaleString() : "Pending timestamp"}
                                </div>
                            </div>
                            {log.performed_by && (
                                <div className="text-xs text-slate-500">by {log.performed_by.slice(0, 6)}</div>
                            )}
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <div className="text-sm text-slate-500">No audit entries yet.</div>
                    )}
                </div>

                <div className="space-y-2">
                    <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add comment or observation..."
                        className="bg-slate-900/70 border-slate-800 text-slate-100"
                        rows={3}
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleSubmit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-500">
                            <Send size={16} className="mr-2" />
                            {submitting ? "Posting..." : "Post"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
