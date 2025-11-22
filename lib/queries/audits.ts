import { createClient } from "@/lib/supabase/client";
import { Audit, AuditChecklistItem } from "@/types/qms";

export async function getAudits() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("audits")
        .select("*")
        .order("scheduled_date", { ascending: true });

    if (error) throw error;
    return data as Audit[];
}

export async function createAudit(audit: Omit<Audit, "id" | "created_at">) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("audits")
        .insert(audit)
        .select()
        .single();

    if (error) throw error;
    return data as Audit;
}

export async function getAuditChecklist(auditId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("audit_checklist_items")
        .select("*")
        .eq("audit_id", auditId);

    if (error) throw error;
    return data as AuditChecklistItem[];
}
