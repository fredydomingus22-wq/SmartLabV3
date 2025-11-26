import { SAMPLE_STATUS, type SampleStatus } from "@/lib/constants/status";
import type { UserRole } from "@/lib/hooks/usePermissions";

export type SampleWorkflowAction =
    | "assign"
    | "start_analysis"
    | "submit_review"
    | "approve"
    | "reject";

interface TransitionResult {
    allowed: boolean;
    reason?: string;
}

const roleCanStartAnalysis = (role: UserRole | null) =>
    role === "technician" || role === "supervisor";

const roleCanReview = (role: UserRole | null) =>
    role === "manager" || role === "supervisor";

const actionToStatusMap: Record<Exclude<SampleWorkflowAction, "assign">, SampleStatus> = {
    start_analysis: SAMPLE_STATUS.IN_ANALYSIS,
    submit_review: SAMPLE_STATUS.UNDER_REVIEW,
    approve: SAMPLE_STATUS.APPROVED,
    reject: SAMPLE_STATUS.REJECTED,
};

export function validateTransition(
    currentStatus: SampleStatus,
    nextStatus: SampleStatus,
    userRole: UserRole | null
): TransitionResult {
    if (currentStatus === nextStatus) {
        return { allowed: false, reason: "Status is already set to this value." };
    }

    switch (currentStatus) {
        case SAMPLE_STATUS.PENDING:
            if (nextStatus === SAMPLE_STATUS.IN_ANALYSIS && roleCanStartAnalysis(userRole)) {
                return { allowed: true };
            }
            break;
        case SAMPLE_STATUS.IN_ANALYSIS:
            if (nextStatus === SAMPLE_STATUS.UNDER_REVIEW && roleCanStartAnalysis(userRole)) {
                return { allowed: true };
            }
            break;
        case SAMPLE_STATUS.UNDER_REVIEW:
            if (
                (nextStatus === SAMPLE_STATUS.APPROVED || nextStatus === SAMPLE_STATUS.REJECTED) &&
                roleCanReview(userRole)
            ) {
                return { allowed: true };
            }
            break;
        case SAMPLE_STATUS.REJECTED:
            if (nextStatus === SAMPLE_STATUS.IN_ANALYSIS && roleCanStartAnalysis(userRole)) {
                return { allowed: true };
            }
            break;
        default:
            break;
    }

    return { allowed: false, reason: "Transition not permitted for this role or status." };
}

export function getAllowedActions(
    status: SampleStatus,
    userRole: UserRole | null
): SampleWorkflowAction[] {
    const actions: SampleWorkflowAction[] = [];

    if (status === SAMPLE_STATUS.PENDING) {
        actions.push("assign");
        if (roleCanStartAnalysis(userRole)) {
            actions.push("start_analysis");
        }
    }

    if (status === SAMPLE_STATUS.IN_ANALYSIS && roleCanStartAnalysis(userRole)) {
        actions.push("submit_review");
    }

    if (status === SAMPLE_STATUS.UNDER_REVIEW && roleCanReview(userRole)) {
        actions.push("approve", "reject");
    }

    if (status === SAMPLE_STATUS.REJECTED && roleCanStartAnalysis(userRole)) {
        actions.push("start_analysis");
    }

    return actions;
}

export function getNextStatusForAction(action: SampleWorkflowAction): SampleStatus | null {
    if (action === "assign") return null;
    return actionToStatusMap[action];
}
