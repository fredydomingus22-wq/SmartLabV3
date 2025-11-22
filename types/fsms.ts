export interface FoodSafetyPRP {
    id: string;
    name: string;
    area?: string;
    frequency?: string;
    status: 'active' | 'inactive';
    created_at: string;
}

export interface FoodSafetyOPRP {
    id: string;
    name: string;
    hazard?: string;
    frequency?: string;
    limit?: number;
    status: 'active' | 'inactive';
    created_at: string;
}

export interface FoodSafetyPCC {
    id: string;
    name: string;
    critical_limit?: string;
    status: 'active' | 'inactive';
    created_at: string;
}
