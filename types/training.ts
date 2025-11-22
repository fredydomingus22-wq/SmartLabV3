export interface Training {
    id: string;
    title: string;
    description?: string;
    instructor?: string;
    duration_hours?: number;
    date?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    created_at: string;
}

export interface TrainingAssignment {
    id: string;
    training_id: string;
    user_id: string;
    assigned_date: string;
    completion_date?: string;
    status: 'assigned' | 'in_progress' | 'completed' | 'failed';
    score?: number;
    certificate_url?: string;
    created_at: string;
}
