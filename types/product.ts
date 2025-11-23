// Product Types and Interfaces
// Enhanced with specifications and test tracking

export interface Product {
    id: string;
    name: string;
    sku: string;
    description: string | null;
    category?: string;
    product_type?: 'beverage' | 'syrup' | 'concentrate' | 'other';
    shelf_life_days?: number;
    storage_conditions?: string;
    active?: boolean;
    created_at: string;
    updated_at?: string;
}

export interface ProductSpec {
    id: string;
    product_id: string;
    parameter_id: string;
    spec_min: number | null;
    spec_target: number | null;
    spec_max: number | null;
    unit: string | null;
    test_frequency?: 'per_batch' | 'daily' | 'weekly' | 'per_tank' | 'per_sample';
    test_level?: 'incoming' | 'in_process' | 'finished' | 'line';
    is_critical?: boolean;
    notes?: string;
    created_at: string;
    updated_at?: string;
    // Joined data
    parameter?: {
        id: string;
        name: string;
        description?: string | null;
        unit?: string;
        category?: string;
    };
}

export interface ProductTest {
    id: string;
    product_id: string;
    production_lot_id?: string | null;
    tank_id?: string | null;
    sample_id?: string | null;
    parameter_id: string;
    measured_value: number;
    spec_min: number | null;
    spec_target: number | null;
    spec_max: number | null;
    unit: string | null;
    result_status: 'in_spec' | 'out_of_spec';
    test_level: 'incoming' | 'in_process' | 'finished' | 'line';
    tested_by: string | null;
    tested_at: string;
    notes?: string | null;
    created_at: string;
    // Joined data
    parameter?: {
        id: string;
        name: string;
        description?: string | null;
    };
    production_lot?: {
        id: string;
        code: string;
    };
}

export interface ProductWithDetails extends Product {
    specs?: ProductSpec[];
    test_count?: number;
    latest_test?: ProductTest;
    pass_rate?: number;
}

export interface ProductQualitySummary {
    product_id: string;
    product_name: string;
    sku: string;
    total_specs: number;
    critical_specs: number;
    total_tests: number;
    tests_passed: number;
    tests_failed: number;
    pass_rate: number | null;
    last_test_date: string | null;
}

// Form data types
export interface CreateProductData {
    name: string;
    sku: string;
    description?: string;
    category?: string;
    product_type?: 'beverage' | 'syrup' | 'concentrate' | 'other';
    shelf_life_days?: number;
    storage_conditions?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
    active?: boolean;
}

export interface CreateProductSpecData {
    product_id: string;
    parameter_id: string;
    spec_min?: number;
    spec_target?: number;
    spec_max?: number;
    unit?: string;
    test_frequency?: 'per_batch' | 'daily' | 'weekly' | 'per_tank' | 'per_sample';
    test_level?: 'incoming' | 'in_process' | 'finished' | 'line';
    is_critical?: boolean;
    notes?: string;
}

export interface CreateProductTestData {
    product_id: string;
    production_lot_id?: string;
    tank_id?: string;
    sample_id?: string;
    parameter_id: string;
    measured_value: number;
    spec_min?: number;
    spec_target?: number;
    spec_max?: number;
    unit?: string;
    result_status: 'in_spec' | 'out_of_spec';
    test_level: 'incoming' | 'in_process' | 'finished' | 'line';
    tested_by?: string;
    tested_at?: string;
    notes?: string;
}

// Filter types
export interface ProductTestFilters {
    test_level?: 'incoming' | 'in_process' | 'finished' | 'line';
    result_status?: 'in_spec' | 'out_of_spec';
    date_from?: string;
    date_to?: string;
    parameter_id?: string;
}

export interface ProductFilters {
    active?: boolean;
    product_type?: 'beverage' | 'syrup' | 'concentrate' | 'other';
    category?: string;
    search?: string;
}
