export interface Reagent {
    id: string;
    name: string;
    expiry_date?: string;
    stock_level?: number;
    unit?: string;
    last_used?: string;
    created_at: string;
}
