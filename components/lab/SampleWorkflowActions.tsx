"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, PlayCircle, Send, CheckCircle2, XCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/lib/hooks/usePermissions";
import { SAMPLE_STATUS, type SampleStatus } from "@/lib/constants/status";
import {
    getAllowedActions,
    getNextStatusForAction,
    validateTransition,
    type SampleWorkflowAction,
} from "@/lib/workflows/samples";
import { updateSampleStatus } from "@/lib/queries/samples";
import { AnalystAssignmentDialog } from "./AnalystAssignmentDialog";

interface SampleWorkflowActionsProps {
    sampleId: string;
    status: SampleStatus;
    userRole: UserRole | null;
    assignedTo?: string | null;
    onStatusChange?: (status: SampleStatus) => void;
    onAssigned?: (analystId: string) => void;
}

const actionCopy: Record<Exclude<SampleWorkflowAction, "assign">, { label: string; icon: React.ReactNode }> = {
    start_analysis: { label: "Start Analysis", icon: <PlayCircle className="h-4 w-4" /> },
    submit_review: { label: "Submit Review", icon: <Send className="h-4 w-4" /> },
    approve: { label: "Approve", icon: <CheckCircle2 className="h-4 w-4" /> },
    reject: { label: "Reject", icon: <XCircle className="h-4 w-4" /> },
};

export function SampleWorkflowActions({
    sampleId,
    status,
    userRole,
    assignedTo,
    onStatusChange,
    onAssigned,
}: SampleWorkflowActionsProps) {
    const [loadingAction, setLoadingAction] = useState<SampleWorkflowAction | null>(null);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);

    const actions = useMemo(() => getAllowedActions(status, userRole), [status, userRole]);

    async function handleAction(action: SampleWorkflowAction) {
        if (action === "assign") {
            setAssignDialogOpen(true);
            return;
        }

        const nextStatus = getNextStatusForAction(action);
        if (!nextStatus) return;

        const validation = validateTransition(status, nextStatus, userRole);
        if (!validation.allowed) {
            toast.error(validation.reason || "Transition not allowed");
            return;
        }

        setLoadingAction(action);
        try {
            await updateSampleStatus(sampleId, nextStatus);
            toast.success(`Status updated to ${nextStatus.replace("_", " ")}`);
            onStatusChange?.(nextStatus);
        } catch (error) {
            console.error("Workflow action error", error);
            toast.error("Failed to update status");
        } finally {
            setLoadingAction(null);
        }
    }

    const renderActionButton = (action: SampleWorkflowAction) => {
        if (action === "assign") {
            return (
                <Button
                    key="assign"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction("assign")}
                    disabled={loadingAction !== null}
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {assignedTo ? "Reassign" : "Assign"}
                </Button>
            );
        }

        const copy = actionCopy[action];
        const targetStatus = getNextStatusForAction(action) || status;
        const variant: "default" | "destructive" | "secondary" | "outline" =
            targetStatus === SAMPLE_STATUS.APPROVED
                ? "default"
                : targetStatus === SAMPLE_STATUS.REJECTED
                    ? "destructive"
                    : "secondary";

        return (
            <Button
                key={action}
                size="sm"
                variant={variant}
                onClick={() => handleAction(action)}
                disabled={loadingAction !== null}
            >
                {loadingAction === action ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                    copy.icon
                )}
                {copy.label}
            </Button>
        );
    };

    return (
        <>
            <div className="flex flex-wrap gap-2">
                {actions.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No actions available</span>
                ) : (
                    actions.map((action) => renderActionButton(action))
                )}
            </div>

            <AnalystAssignmentDialog
                open={assignDialogOpen}
                onOpenChange={setAssignDialogOpen}
                sampleId={sampleId}
                currentAnalystId={assignedTo}
                onAssigned={(analystId) => {
                    onAssigned?.(analystId);
                    setAssignDialogOpen(false);
                }}
            />
        </>
    );
}
