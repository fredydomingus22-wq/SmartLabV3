export interface Equipment {
    id: string;
    name: string;
    calibration_due?: string;
    last_calibrated?: string;
    status: 'active' | 'inactive' | 'maintenance';
    created_at: string;
}
