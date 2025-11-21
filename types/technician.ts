export interface Technician {
    id: string;
    name: string;
    contact?: string;
    role?: string;
    entry_date?: string;
    signature_pin_hash: string;
    active: boolean;
    created_at: string;
}
