// Workflow logic for Sample entity
// Handles analyst assignment and status transitions
import { createClient } from "@/lib/supabase/client";
import { SAMPLE_STATUS, type SampleStatus } from "@/lib/constants/status";
import type { Database } from "@/types/database";

type SampleRow = Database["public"]["Tables"]["samples"]["Row"];

/** Assign an analyst (technician) to a sample */
export async function assignAnalyst(sampleId: string, analystId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("samples")
        .update({ assigned_to: analystId })
        .eq("id", sampleId)
        .select()
        .single();
    if (error) throw error;
    return data as SampleRow;
}

/** Transition sample status, ensuring it is a valid enum value */
export async function transitionSampleStatus(sampleId: string, newStatus: keyof typeof SAMPLE_STATUS) {
    if (!Object.values(SAMPLE_STATUS).includes(newStatus as any)) {
        throw new Error(`Invalid status: ${newStatus}`);
    }
    const supabase = createClient();
    const { data, error } = await supabase
        .from("samples")
        .update({ status: newStatus })
        .eq("id", sampleId)
        .select()
        .single();
    if (error) throw error;
    return data as SampleRow;
}

/** Fetch a sample by ID (helper) */
export async function getSampleById(sampleId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("samples")
        .select(`*`)
        .eq("id", sampleId)
        .single();
    if (error) throw error;
    return data as SampleRow;
}
// Workflow helper functions for UI actions

export type SampleWorkflowAction = "assign" | "start_analysis" | "submit_review" | "approve" | "reject";

/** Determine allowed actions based on sample status and user role */
export function getAllowedActions(status: SampleStatus, userRole: string | null): SampleWorkflowAction[] {
    const actions: SampleWorkflowAction[] = [];
    // Simple role check: only managers and technicians can assign
    const canAssign = userRole === "manager" || userRole === "technician";
    switch (status) {
        case SAMPLE_STATUS.PENDING:
            if (canAssign) actions.push("assign");
            actions.push("start_analysis");
            break;
        case SAMPLE_STATUS.IN_ANALYSIS:
            actions.push("submit_review");
            break;
        case SAMPLE_STATUS.UNDER_REVIEW:
            actions.push("approve", "reject");
            break;
        default:
            // No actions for final states
            break;
    }
    return actions;
}

/** Map a workflow action to the resulting sample status */
export function getNextStatusForAction(action: SampleWorkflowAction): SampleStatus | null {
    switch (action) {
        case "start_analysis":
            return SAMPLE_STATUS.IN_ANALYSIS;
        case "submit_review":
            return SAMPLE_STATUS.UNDER_REVIEW;
        case "approve":
            return SAMPLE_STATUS.APPROVED;
        case "reject":
            return SAMPLE_STATUS.REJECTED;
        case "assign":
            return null; // assignment does not change status
        default:
            return null;
    }
}

/** Validate whether a transition from current to next status is allowed */
export function validateTransition(current: SampleStatus, next: SampleStatus, userRole: string | null): { allowed: boolean; reason?: string } {
    // Define allowed transitions
    const allowedMap: Record<SampleStatus, SampleStatus[]> = {
        [SAMPLE_STATUS.PENDING]: [SAMPLE_STATUS.IN_ANALYSIS],
        [SAMPLE_STATUS.IN_ANALYSIS]: [SAMPLE_STATUS.UNDER_REVIEW],
        [SAMPLE_STATUS.UNDER_REVIEW]: [SAMPLE_STATUS.APPROVED, SAMPLE_STATUS.REJECTED],
        [SAMPLE_STATUS.APPROVED]: [],
        [SAMPLE_STATUS.REJECTED]: [],
    };

    const allowedNext = allowedMap[current] || [];
    if (!allowedNext.includes(next)) {
        return { allowed: false, reason: `Transition from ${current} to ${next} is not permitted.` };
    }
    // Simple role restriction: only manager or technician can move to next status
    if (userRole !== "manager" && userRole !== "technician") {
        return { allowed: false, reason: "Insufficient permissions for status transition." };
    }
    return { allowed: true };
}
