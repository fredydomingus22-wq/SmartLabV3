import { createClient } from "@/lib/supabase/client";

export type NcStatus = "open" | "in_progress" | "escalated" | "resolved" | "closed" | "cancelled";
export type NcSeverity = "low" | "medium" | "high" | "critical";

export interface NonConformity {
    id: string;
    code?: string;
    title: string;
    description?: string;
    status: NcStatus;
    severity: NcSeverity;
    category?: string;
    deviation_type?: string;
    detection_source?: string;
    product_id?: string;
    production_lot_id?: string;
    intermediate_lot_id?: string;
    finished_lot_id?: string;
    line?: string;
    shift?: string;
    opened_by?: string;
    owner_id?: string;
    qa_supervisor_id?: string;
    due_date?: string;
    containment_actions?: string;
    impact?: string;
    closed_at?: string;
    closed_by?: string;
    created_at: string;
    updated_at: string;
}

export interface NcRootCause {
    id: string;
    nc_id: string;
    method: "5_whys" | "ishikawa" | "pareto" | "other";
    description: string;
    contributing_factor?: string;
    created_by?: string;
    verified_by?: string;
    created_at: string;
    updated_at: string;
}

export interface NcAction {
    id: string;
    nc_id: string;
    action_type: "corrective" | "preventive" | "containment" | "capa";
    title: string;
    description?: string;
    owner_id?: string;
    due_date?: string;
    completed_at?: string;
    status: "open" | "in_progress" | "done" | "overdue" | "cancelled";
    evidence_url?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface NcAttachment {
    id: string;
    nc_id: string;
    file_url: string;
    file_name?: string;
    file_type?: string;
    uploaded_by?: string;
    uploaded_at: string;
}

export interface NcAuditLog {
    id: string;
    nc_id?: string;
    action: string;
    details?: Record<string, unknown>;
    performed_by?: string;
    performed_at: string;
}

export interface NcFilters {
    status?: NcStatus | NcStatus[];
    severity?: NcSeverity | NcSeverity[];
    line?: string;
    ownerId?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

export type CreateNcPayload = Omit<NonConformity, "id" | "created_at" | "updated_at" | "closed_at" | "closed_by">;
export type CreateRootCausePayload = Omit<NcRootCause, "id" | "created_at" | "updated_at">;
export type CreateActionPayload = Omit<NcAction, "id" | "created_at" | "updated_at">;
export type CreateAttachmentPayload = Omit<NcAttachment, "id" | "uploaded_at">;
export type CreateAuditLogPayload = Omit<NcAuditLog, "id" | "performed_at">;

export async function createNc(payload: CreateNcPayload): Promise<NonConformity> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("non_conformities")
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data as NonConformity;
}

export async function getNcById(id: string): Promise<NonConformity & {
    root_causes?: NcRootCause[];
    actions?: NcAction[];
    attachments?: NcAttachment[];
    audit_logs?: NcAuditLog[];
}> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("non_conformities")
        .select(`
            *,
            root_causes:nc_root_causes(*),
            actions:nc_actions(*),
            attachments:nc_attachments(*),
            audit_logs:nc_audit_logs(*)
        `)
        .eq("id", id)
        .single();

    if (error) throw error;
    return data as NonConformity & {
        root_causes?: NcRootCause[];
        actions?: NcAction[];
        attachments?: NcAttachment[];
        audit_logs?: NcAuditLog[];
    };
}

export async function listNc(filters: NcFilters = {}): Promise<NonConformity[]> {
    const supabase = createClient();
    let query = supabase.from("non_conformities").select("*").order("created_at", { ascending: false });

    if (filters.status) {
        const statusValues = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in("status", statusValues);
    }

    if (filters.severity) {
        const severityValues = Array.isArray(filters.severity) ? filters.severity : [filters.severity];
        query = query.in("severity", severityValues);
    }

    if (filters.line) {
        query = query.eq("line", filters.line);
    }

    if (filters.ownerId) {
        query = query.eq("owner_id", filters.ownerId);
    }

    if (filters.search) {
        const pattern = `%${filters.search}%`;
        query = query.or(`code.ilike.${pattern},title.ilike.${pattern},description.ilike.${pattern}`);
    }

    if (filters.limit) {
        query = query.limit(filters.limit);
    }

    if (typeof filters.offset === "number") {
        query = query.range(filters.offset, (filters.offset + (filters.limit ?? 20)) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as NonConformity[];
}

export async function updateNcStatus(id: string, status: NcStatus, closedBy?: string): Promise<NonConformity> {
    const supabase = createClient();
    const updates: Partial<NonConformity> = { status };

    if (status === "closed" || status === "resolved") {
        updates.closed_at = new Date().toISOString();
        if (closedBy) {
            updates.closed_by = closedBy;
        }
    }

    const { data, error } = await supabase
        .from("non_conformities")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as NonConformity;
}

export async function addRootCause(payload: CreateRootCausePayload): Promise<NcRootCause> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("nc_root_causes")
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data as NcRootCause;
}

export async function addCapaAction(payload: CreateActionPayload): Promise<NcAction> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("nc_actions")
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data as NcAction;
}

export async function uploadEvidence(payload: CreateAttachmentPayload): Promise<NcAttachment> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("nc_attachments")
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data as NcAttachment;
}

export async function logAuditEvent(payload: CreateAuditLogPayload): Promise<NcAuditLog> {
    const supabase = createClient();
    let finalPayload = payload;

    if (!payload.performed_by) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
            finalPayload = { ...payload, performed_by: user.id };
        }
    }

    const { data, error } = await supabase
        .from("nc_audit_logs")
        .insert(finalPayload)
        .select()
        .single();

    if (error) throw error;
    return data as NcAuditLog;
}
