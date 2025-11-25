import { createClient } from "@/lib/supabase/client";
import { AuditEntry } from "@/types/audit";

export async function getAuditLogs(limit = 50): Promise<AuditEntry[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .order("performed_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data as AuditEntry[];
}

export async function fetchAuditLog(tableName: string, rowId: string): Promise<AuditEntry[]> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("fetch_audit_log", {
        p_table_name: tableName,
        p_row_id: rowId,
    });

    if (error) throw error;
    return data as AuditEntry[];
}
