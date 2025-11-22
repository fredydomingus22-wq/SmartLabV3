export interface NonConformity {
    id: string;
    code?: string;
    description?: string;
    status: 'open' | 'closed' | 'in_progress';
    sample_id?: string;
    parameter_id?: string;
    deviation_type?: string;
    root_cause?: string;
    corrective_action?: string;
    closed_by?: string;
    closed_at?: string;
    created_at: string;
}

export interface EightDReport {
    id: string;
    nc_id: string;
    d1_team: string[];
    d2_problem: string;
    d3_containment: string;
    d4_root_cause: string;
    d5_corrective_action: string;
    d6_validation: string;
    d7_prevention: string;
    d8_recognition: string;
    status: 'open' | 'closed';
    created_at: string;
}

export interface Audit {
    id: string;
    code: string;
    type: 'internal' | 'external' | 'supplier';
    status: 'scheduled' | 'in_progress' | 'completed';
    auditor_id: string;
    scheduled_date: string;
    checklist_template_id?: string;
    findings?: string;
    score?: number;
    created_at: string;
}

export interface AuditChecklistItem {
    id: string;
    audit_id: string;
    question: string;
    response: 'compliant' | 'non_compliant' | 'na';
    comments?: string;
}
