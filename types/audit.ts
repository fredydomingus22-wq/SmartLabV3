export interface AuditEntry {
    id: string;
    table_name: string;
    operation: "INSERT" | "UPDATE" | "DELETE";
    row_id: string;
    old_data?: Record<string, unknown> | null;
    new_data?: Record<string, unknown> | null;
    performed_by: string | null;
    performed_at: string;
}

// Backwards compatibility alias for legacy imports
export type AuditLog = AuditEntry;
