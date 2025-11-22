export interface Technician {
    id: string;
    name: string;
    role: string;
    contact?: string;
    entry_date?: string;
    signature_pin_hash: string;
    active: boolean;
    created_at: string;
}
