export interface AuditLog {
    id: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    details?: any;
    performed_by: string;
    performed_at: string;
    ip_address?: string;
    performer?: {
        full_name: string;
        email: string;
    };
}
