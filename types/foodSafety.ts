export type FoodSafetyType = "prp" | "oprp" | "pcc";

export type FoodSafetyStatus = "open" | "monitoring" | "breach" | "closed";

export interface FoodSafetyRecord {
    id: string;
    title: string;
    hazard: string;
    critical_limit: string;
    monitoring_frequency: string;
    evidence: string;
    immediate_actions: string;
    status: FoodSafetyStatus;
    responsible?: string;
    due_date?: string;
    last_check?: string;
    closing_comment?: string;
    created_at?: string;
    updated_at?: string;
    closed_at?: string;
}

export interface FoodSafetyPayload extends Omit<FoodSafetyRecord, "id" | "created_at" | "updated_at" | "closed_at"> {}
