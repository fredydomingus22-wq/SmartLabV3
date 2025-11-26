// Status value constants for the application
// Updated to use English standardized values (Phase 2)

export const PRODUCTION_LOT_STATUS = {
    DRAFT: 'draft',
    ACTIVE: 'active',
    ON_HOLD: 'on_hold',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
} as const;

export type ProductionLotStatus = typeof PRODUCTION_LOT_STATUS[keyof typeof PRODUCTION_LOT_STATUS];

export const SAMPLE_STATUS = {
    PENDING: 'pending',
    IN_ANALYSIS: 'in_analysis',
    UNDER_REVIEW: 'under_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
} as const;

export type SampleStatus = typeof SAMPLE_STATUS[keyof typeof SAMPLE_STATUS];

export const NC_STATUS = {
    DRAFT: 'draft',
    OPEN: 'open',
    INVESTIGATING: 'investigating',
    PENDING_APPROVAL: 'pending_approval',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CLOSED: 'closed',
} as const;

export type NCStatus = typeof NC_STATUS[keyof typeof NC_STATUS];

// Display labels for UI (can be translated later)
export const PRODUCTION_LOT_STATUS_LABELS: Record<ProductionLotStatus, string> = {
    [PRODUCTION_LOT_STATUS.DRAFT]: 'Draft',
    [PRODUCTION_LOT_STATUS.ACTIVE]: 'Active',
    [PRODUCTION_LOT_STATUS.ON_HOLD]: 'On Hold',
    [PRODUCTION_LOT_STATUS.COMPLETED]: 'Completed',
    [PRODUCTION_LOT_STATUS.CANCELLED]: 'Cancelled',
};

export const SAMPLE_STATUS_LABELS: Record<SampleStatus, string> = {
    [SAMPLE_STATUS.PENDING]: 'Pending',
    [SAMPLE_STATUS.IN_ANALYSIS]: 'In Analysis',
    [SAMPLE_STATUS.UNDER_REVIEW]: 'Under Review',
    [SAMPLE_STATUS.APPROVED]: 'Approved',
    [SAMPLE_STATUS.REJECTED]: 'Rejected',
};

export const NC_STATUS_LABELS: Record<NCStatus, string> = {
    [NC_STATUS.DRAFT]: 'Draft',
    [NC_STATUS.OPEN]: 'Open',
    [NC_STATUS.INVESTIGATING]: 'Investigating',
    [NC_STATUS.PENDING_APPROVAL]: 'Pending Approval',
    [NC_STATUS.APPROVED]: 'Approved',
    [NC_STATUS.REJECTED]: 'Rejected',
    [NC_STATUS.CLOSED]: 'Closed',
};
