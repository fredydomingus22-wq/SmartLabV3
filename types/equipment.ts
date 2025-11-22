export interface Equipment {
    id: string;
    name: string;
    code: string;
    type: string;
    manufacturer?: string;
    model?: string;
    serial_number?: string;
    location?: string;
    calibration_due?: string;
    last_calibrated?: string;
    calibration_frequency_days?: number;
    status: 'active' | 'inactive' | 'maintenance' | 'calibration_due';
    responsible?: string;
    created_at: string;
}
