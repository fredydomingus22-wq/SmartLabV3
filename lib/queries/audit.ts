import { createClient } from "@/lib/supabase/client";
import { AuditLog } from "@/types/audit";

export async function getAuditLogs(limit = 50) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("audit_logs")
        .select(`
            *,
            performer:profiles(full_name, email)
        `)
        .order("performed_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data as AuditLog[];
}

export async function logAction(
    action: string,
    entityType: string,
    entityId: string | null,
    details: any = null
) {
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from("audit_logs")
        .insert({
            action,
            entity_type: entityType,
            entity_id: entityId,
            details,
            performed_by: user.id
        });

    if (error) console.error("Failed to log action:", error);
}
