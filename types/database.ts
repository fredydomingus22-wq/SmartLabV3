// Generated TypeScript types from Supabase database
// This file will be replaced with actual generated types

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            approval_requests: {
                Row: {
                    id: string
                    type: string
                    title: string
                    status: 'pending' | 'approved' | 'rejected'
                    requested_by: string
                    approved_by: string | null
                    approved_at: string | null
                    rejected_by: string | null
                    rejected_at: string | null
                    rejection_reason: string | null
                    tenant_id: string
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    type: string
                    title: string
                    status?: 'pending' | 'approved' | 'rejected'
                    requested_by: string
                    approved_by?: string | null
                    approved_at?: string | null
                    rejected_by?: string | null
                    rejected_at?: string | null
                    rejection_reason?: string | null
                    tenant_id: string
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    type?: string
                    title?: string
                    status?: 'pending' | 'approved' | 'rejected'
                    requested_by?: string
                    approved_by?: string | null
                    approved_at?: string | null
                    rejected_by?: string | null
                    rejected_at?: string | null
                    rejection_reason?: string | null
                    tenant_id?: string
                    created_at?: string
                    updated_at?: string | null
                }
            }
            approval_signatures: {
                Row: {
                    id: string
                    approval_request_id: string
                    user_id: string
                    action: 'approve' | 'reject'
                    signature_method: 'password' | 'digital_id'
                    comments: string | null
                    tenant_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    approval_request_id: string
                    user_id: string
                    action: 'approve' | 'reject'
                    signature_method: 'password' | 'digital_id'
                    comments?: string | null
                    tenant_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    approval_request_id?: string
                    user_id?: string
                    action?: 'approve' | 'reject'
                    signature_method?: 'password' | 'digital_id'
                    comments?: string | null
                    tenant_id?: string
                    created_at?: string
                }
            }
            tenants: {
                Row: {
                    id: string
                    name: string
                    slug: string | null
                    logo_url: string | null
                    settings: Record<string, unknown> | null
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    slug?: string | null
                    logo_url?: string | null
                    settings?: Record<string, unknown> | null
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string | null
                    logo_url?: string | null
                    settings?: Record<string, unknown> | null
                    created_at?: string
                    updated_at?: string | null
                }
            }
            tenant_members: {
                Row: {
                    id: string
                    tenant_id: string
                    user_id: string
                    role: string
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    user_id: string
                    role?: string
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    user_id?: string
                    role?: string
                    created_at?: string
                    updated_at?: string | null
                }
            }
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    full_name: string | null
                    avatar_url: string | null
                    role: string | null
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    email?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: string | null
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    email?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: string | null
                    created_at?: string
                    updated_at?: string | null
                }
            }
            factories: {
                Row: {
                    id: string
                    tenant_id: string
                    name: string
                    code: string | null
                    address: string | null
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    name: string
                    code?: string | null
                    address?: string | null
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    name?: string
                    code?: string | null
                    address?: string | null
                    created_at?: string
                    updated_at?: string | null
                }
            }
            audit_logs: {
                Row: {
                    id: string
                    table_name: string
                    record_id: string
                    action: 'INSERT' | 'UPDATE' | 'DELETE'
                    old_data: any | null
                    new_data: any | null
                    changed_fields: string[] | null
                    changed_by: string | null
                    user_email: string | null
                    user_role: string | null
                    changed_at: string
                    ip_address: string | null
                    user_agent: string | null
                    tenant_id: string | null
                    factory_id: string | null
                    description: string | null
                    request_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    table_name: string
                    record_id: string
                    action: 'INSERT' | 'UPDATE' | 'DELETE'
                    old_data?: any | null
                    new_data?: any | null
                    changed_fields?: string[] | null
                    changed_by?: string | null
                    user_email?: string | null
                    user_role?: string | null
                    changed_at?: string
                    ip_address?: string | null
                    user_agent?: string | null
                    tenant_id?: string | null
                    factory_id?: string | null
                    description?: string | null
                    request_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    table_name?: string
                    record_id?: string
                    action?: 'INSERT' | 'UPDATE' | 'DELETE'
                    old_data?: any | null
                    new_data?: any | null
                    changed_fields?: string[] | null
                    changed_by?: string | null
                    user_email?: string | null
                    user_role?: string | null
                    changed_at?: string
                    ip_address?: string | null
                    user_agent?: string | null
                    tenant_id?: string | null
                    factory_id?: string | null
                    description?: string | null
                    request_id?: string | null
                    created_at?: string
                }
            }
            audits: {
                Row: {
                    id: string
                    supplier_id: string | null
                    auditor_id: string | null
                    scheduled_date: string | null
                    performed_date: string | null
                    status: 'planned' | 'pending' | 'completed' | 'cancelled'
                    score: number | null
                    report_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    supplier_id?: string | null
                    auditor_id?: string | null
                    scheduled_date?: string | null
                    performed_date?: string | null
                    status?: 'planned' | 'pending' | 'completed' | 'cancelled'
                    score?: number | null
                    report_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    supplier_id?: string | null
                    auditor_id?: string | null
                    scheduled_date?: string | null
                    performed_date?: string | null
                    status?: 'planned' | 'pending' | 'completed' | 'cancelled'
                    score?: number | null
                    report_url?: string | null
                    created_at?: string
                }
            }
            eight_d_reports: {
                Row: {
                    id: string
                    nc_id: string
                    d0_preparation: string | null
                    d1_team: string[] | null
                    d2_problem_description: string | null
                    d3_interim_actions: string | null
                    d4_root_cause: string | null
                    d5_permanent_actions: string | null
                    d6_implementation: string | null
                    d7_prevention: string | null
                    d8_recognition: string | null
                    current_step: number | null
                    status: 'in_progress' | 'completed' | 'cancelled' | null
                    created_by: string | null
                    started_at: string | null
                    completed_at: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    nc_id: string
                    d0_preparation?: string | null
                    d1_team?: string[] | null
                    d2_problem_description?: string | null
                    d3_interim_actions?: string | null
                    d4_root_cause?: string | null
                    d5_permanent_actions?: string | null
                    d6_implementation?: string | null
                    d7_prevention?: string | null
                    d8_recognition?: string | null
                    current_step?: number | null
                    status?: 'in_progress' | 'completed' | 'cancelled' | null
                    created_by?: string | null
                    started_at?: string | null
                    completed_at?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    nc_id?: string
                    d0_preparation?: string | null
                    d1_team?: string[] | null
                    d2_problem_description?: string | null
                    d3_interim_actions?: string | null
                    d4_root_cause?: string | null
                    d5_permanent_actions?: string | null
                    d6_implementation?: string | null
                    d7_prevention?: string | null
                    d8_recognition?: string | null
                    current_step?: number | null
                    status?: 'in_progress' | 'completed' | 'cancelled' | null
                    created_by?: string | null
                    started_at?: string | null
                    completed_at?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            shift_notes: {
                Row: {
                    id: string
                    message: string
                    shift: string | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    message: string
                    shift?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    message?: string
                    shift?: string | null
                    created_by?: string | null
                    created_at?: string
                }
            }
            sample_types: {
                Row: {
                    id: string
                    code: string
                    name: string
                    description: string | null
                    category: string | null
                    config: Json | null
                    created_at: string
                    updated_at: string | null
                    tenant_id: string | null
                }
                Insert: {
                    id?: string
                    code: string
                    name: string
                    description?: string | null
                    category?: string | null
                    config?: Json | null
                    created_at?: string
                    updated_at?: string | null
                    tenant_id?: string | null
                }
                Update: {
                    id?: string
                    code?: string
                    name?: string
                    description?: string | null
                    category?: string | null
                    config?: Json | null
                    created_at?: string
                    updated_at?: string | null
                    tenant_id?: string | null
                }
            }
            intermediate_lots: {
                Row: {
                    id: string
                    code: string
                    production_lot_id: string | null
                    tank_id: string | null
                    status: 'em_producao' | 'terminado' | 'consumido' | 'active' | 'completed'
                    created_at: string
                    updated_at: string | null
                    started_at: string | null
                    completed_at: string | null
                    consumed_at: string | null
                    tenant_id: string | null
                }
                Insert: {
                    id?: string
                    code: string
                    production_lot_id?: string | null
                    tank_id?: string | null
                    status?: 'em_producao' | 'terminado' | 'consumido' | 'active' | 'completed'
                    created_at?: string
                    updated_at?: string | null
                    started_at?: string | null
                    completed_at?: string | null
                    consumed_at?: string | null
                    tenant_id?: string | null
                }
                Update: {
                    id?: string
                    code?: string
                    production_lot_id?: string | null
                    tank_id?: string | null
                    status?: 'em_producao' | 'terminado' | 'consumido' | 'active' | 'completed'
                    created_at?: string
                    updated_at?: string | null
                    started_at?: string | null
                    completed_at?: string | null
                    consumed_at?: string | null
                    tenant_id?: string | null
                }
            }
            finished_product_lots: {
                Row: {
                    id: string
                    code: string
                    intermediate_lot_id: string
                    sku: string | null
                    status: 'active' | 'released' | 'blocked' | 'quarantine' | 'completed'
                    created_at: string
                    updated_at: string | null
                    created_by: string | null
                    tenant_id: string | null
                }
                Insert: {
                    id?: string
                    code: string
                    intermediate_lot_id: string
                    sku?: string | null
                    status?: 'active' | 'released' | 'blocked' | 'quarantine' | 'completed'
                    created_at?: string
                    updated_at?: string | null
                    created_by?: string | null
                    tenant_id?: string | null
                }
                Update: {
                    id?: string
                    code?: string
                    intermediate_lot_id?: string
                    sku?: string | null
                    status?: 'active' | 'released' | 'blocked' | 'quarantine' | 'completed'
                    created_at?: string
                    updated_at?: string | null
                    created_by?: string | null
                    tenant_id?: string | null
                }
            }
            production_lots: {
                Row: {
                    id: string
                    code: string
                    product_id: string | null
                    factory_id: string | null
                    production_line: string | null
                    shift: string | null
                    start_time: string | null
                    end_time: string | null
                    status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled'
                    created_by: string | null
                    created_at: string
                    updated_at: string | null
                    updated_by: string | null
                    production_line_id: string | null
                    shift_id: string | null
                    tenant_id: string | null
                    source_tank_id: string | null
                }
                Insert: {
                    id?: string
                    code: string
                    product_id?: string | null
                    factory_id?: string | null
                    production_line?: string | null
                    shift?: string | null
                    start_time?: string | null
                    end_time?: string | null
                    status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled'
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string | null
                    updated_by?: string | null
                    production_line_id?: string | null
                    shift_id?: string | null
                    tenant_id?: string | null
                    source_tank_id?: string | null
                }
                Update: {
                    id?: string
                    code?: string
                    product_id?: string | null
                    factory_id?: string | null
                    production_line?: string | null
                    shift?: string | null
                    start_time?: string | null
                    end_time?: string | null
                    status?: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled'
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string | null
                    updated_by?: string | null
                    production_line_id?: string | null
                    shift_id?: string | null
                    tenant_id?: string | null
                    source_tank_id?: string | null
                }
            }
            samples: {
                Row: {
                    id: string
                    code: string
                    sample_type_id: string | null
                    status: 'pending' | 'in_analysis' | 'under_review' | 'approved' | 'rejected'
                    collected_at: string
                    collection_point: string | null
                    collected_by: string | null
                    notes: string | null
                    product_id: string | null
                    production_lot_id: string | null
                    raw_material_lot_id: string | null
                    assigned_to: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string | null
                    updated_by: string | null
                    tenant_id: string | null
                    intermediate_lot_id: string | null
                    finished_product_lot_id: string | null
                }
                Insert: {
                    id?: string
                    code: string
                    sample_type_id?: string | null
                    status?: 'pending' | 'in_analysis' | 'under_review' | 'approved' | 'rejected'
                    collected_at: string
                    collection_point?: string | null
                    collected_by?: string | null
                    notes?: string | null
                    product_id?: string | null
                    production_lot_id?: string | null
                    raw_material_lot_id?: string | null
                    assigned_to?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string | null
                    updated_by?: string | null
                    tenant_id?: string | null
                    intermediate_lot_id?: string | null
                    finished_product_lot_id?: string | null
                }
                Update: {
                    id?: string
                    code?: string
                    sample_type_id?: string | null
                    status?: 'pending' | 'in_analysis' | 'under_review' | 'approved' | 'rejected'
                    collected_at?: string
                    collection_point?: string | null
                    collected_by?: string | null
                    notes?: string | null
                    product_id?: string | null
                    production_lot_id?: string | null
                    raw_material_lot_id?: string | null
                    assigned_to?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string | null
                    updated_by?: string | null
                    tenant_id?: string | null
                    intermediate_lot_id?: string | null
                    finished_product_lot_id?: string | null
                }
            }
            lab_analysis: {
                Row: {
                    id: string
                    sample_id: string
                    parameter_id: string
                    result_value: number | null
                    unit: string | null
                    analyst_id: string | null
                    performed_by: string | null
                    analysis_date: string | null
                    validation_status: 'approved' | 'failed' | 'deviation' | null
                    reviewer_id: string | null
                    comment: string | null
                    attachments: any
                    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
                    created_at: string
                    updated_at: string | null
                    updated_by: string | null
                    tenant_id: string | null
                    spec_min: number | null
                    spec_max: number | null
                    spec_target: number | null
                    spec_snapshot_at: string | null
                }
                Insert: {
                    id?: string
                    sample_id: string
                    parameter_id: string
                    result_value?: number | null
                    unit?: string | null
                    analyst_id?: string | null
                    performed_by?: string | null
                    analysis_date?: string | null
                    validation_status?: 'approved' | 'failed' | 'deviation' | null
                    reviewer_id?: string | null
                    comment?: string | null
                    attachments?: any
                    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
                    created_at?: string
                    updated_at?: string | null
                    updated_by?: string | null
                    tenant_id?: string | null
                    spec_min?: number | null
                    spec_max?: number | null
                    spec_target?: number | null
                    spec_snapshot_at?: string | null
                }
                Update: {
                    id?: string
                    sample_id?: string
                    parameter_id?: string
                    result_value?: number | null
                    unit?: string | null
                    analyst_id?: string | null
                    performed_by?: string | null
                    analysis_date?: string | null
                    validation_status?: 'approved' | 'failed' | 'deviation' | null
                    reviewer_id?: string | null
                    comment?: string | null
                    attachments?: any
                    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
                    created_at?: string
                    updated_at?: string | null
                    updated_by?: string | null
                    tenant_id?: string | null
                    spec_min?: number | null
                    spec_max?: number | null
                    spec_target?: number | null
                    spec_snapshot_at?: string | null
                }
            }
            non_conformities: {
                Row: {
                    id: string
                    code: string
                    title: string
                    description: string | null
                    status: 'open' | 'investigating' | 'root_cause_analysis' | 'capa_implementation' | 'verification' | 'closed' | 'cancelled'
                    severity: 'minor' | 'major' | 'critical'
                    type: 'product' | 'process' | 'audit' | 'supplier' | 'customer_complaint' | 'other'
                    source: string | null
                    detected_by: string | null
                    detected_at: string
                    assigned_to: string | null
                    product_id: string | null
                    production_lot_id: string | null
                    sample_id: string | null
                    created_at: string
                    updated_at: string | null
                    updated_by: string | null
                    tenant_id: string | null
                    root_cause: string | null
                    immediate_action: string | null
                    preventive_action: string | null
                    closure_date: string | null
                    closed_by: string | null
                }
                Insert: {
                    id?: string
                    code: string
                    title: string
                    description?: string | null
                    status?: 'open' | 'investigating' | 'root_cause_analysis' | 'capa_implementation' | 'verification' | 'closed' | 'cancelled'
                    severity: 'minor' | 'major' | 'critical'
                    type: 'product' | 'process' | 'audit' | 'supplier' | 'customer_complaint' | 'other'
                    source?: string | null
                    detected_by?: string | null
                    detected_at: string
                    assigned_to?: string | null
                    product_id?: string | null
                    production_lot_id?: string | null
                    sample_id?: string | null
                    created_at?: string
                    updated_at?: string | null
                    updated_by?: string | null
                    tenant_id?: string | null
                    root_cause?: string | null
                    immediate_action?: string | null
                    preventive_action?: string | null
                    closure_date?: string | null
                    closed_by?: string | null
                }
                Update: {
                    id?: string
                    code?: string
                    title?: string
                    description?: string | null
                    status?: 'open' | 'investigating' | 'root_cause_analysis' | 'capa_implementation' | 'verification' | 'closed' | 'cancelled'
                    severity?: 'minor' | 'major' | 'critical'
                    type?: 'product' | 'process' | 'audit' | 'supplier' | 'customer_complaint' | 'other'
                    source?: string | null
                    detected_by?: string | null
                    detected_at?: string
                    assigned_to?: string | null
                    product_id?: string | null
                    production_lot_id?: string | null
                    sample_id?: string | null
                    created_at?: string
                    updated_at?: string | null
                    updated_by?: string | null
                    tenant_id?: string | null
                    root_cause?: string | null
                    immediate_action?: string | null
                    preventive_action?: string | null
                    closure_date?: string | null
                    closed_by?: string | null
                }
            }
            // =====================================================
            // MICROBIOLOGY MODULE
            // =====================================================
            micro_media_types: {
                Row: {
                    id: string
                    tenant_id: string
                    code: string
                    name: string
                    description: string | null
                    incubation_temp_min: number | null
                    incubation_temp_max: number | null
                    incubation_hours_min: number | null
                    incubation_hours_max: number | null
                    target_organisms: string[] | null
                    is_active: boolean
                    created_at: string
                    updated_at: string | null
                    created_by: string | null
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    code: string
                    name: string
                    description?: string | null
                    incubation_temp_min?: number | null
                    incubation_temp_max?: number | null
                    incubation_hours_min?: number | null
                    incubation_hours_max?: number | null
                    target_organisms?: string[] | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string | null
                    created_by?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    code?: string
                    name?: string
                    description?: string | null
                    incubation_temp_min?: number | null
                    incubation_temp_max?: number | null
                    incubation_hours_min?: number | null
                    incubation_hours_max?: number | null
                    target_organisms?: string[] | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string | null
                    created_by?: string | null
                }
            }
            micro_media_lots: {
                Row: {
                    id: string
                    tenant_id: string
                    media_type_id: string
                    lot_code: string
                    batch_number: string | null
                    supplier_name: string | null
                    manufacturer: string | null
                    manufacture_date: string | null
                    expiry_date: string
                    received_date: string | null
                    initial_quantity: number
                    current_quantity: number
                    unit: string
                    qc_status: 'pending' | 'approved' | 'rejected' | 'expired'
                    qc_notes: string | null
                    qc_performed_by: string | null
                    qc_performed_at: string | null
                    storage_location: string | null
                    storage_temp_c: number | null
                    is_active: boolean
                    created_at: string
                    updated_at: string | null
                    created_by: string | null
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    media_type_id: string
                    lot_code: string
                    batch_number?: string | null
                    supplier_name?: string | null
                    manufacturer?: string | null
                    manufacture_date?: string | null
                    expiry_date: string
                    received_date?: string | null
                    initial_quantity: number
                    current_quantity: number
                    unit?: string
                    qc_status?: 'pending' | 'approved' | 'rejected' | 'expired'
                    qc_notes?: string | null
                    qc_performed_by?: string | null
                    qc_performed_at?: string | null
                    storage_location?: string | null
                    storage_temp_c?: number | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string | null
                    created_by?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    media_type_id?: string
                    lot_code?: string
                    batch_number?: string | null
                    supplier_name?: string | null
                    manufacturer?: string | null
                    manufacture_date?: string | null
                    expiry_date?: string
                    received_date?: string | null
                    initial_quantity?: number
                    current_quantity?: number
                    unit?: string
                    qc_status?: 'pending' | 'approved' | 'rejected' | 'expired'
                    qc_notes?: string | null
                    qc_performed_by?: string | null
                    qc_performed_at?: string | null
                    storage_location?: string | null
                    storage_temp_c?: number | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string | null
                    created_by?: string | null
                }
            }
            micro_incubators: {
                Row: {
                    id: string
                    tenant_id: string
                    factory_id: string | null
                    code: string
                    name: string
                    model: string | null
                    serial_number: string | null
                    setpoint_temp_c: number
                    temp_tolerance: number
                    capacity_plates: number | null
                    capacity_shelves: number | null
                    last_calibration_date: string | null
                    next_calibration_date: string | null
                    calibration_certificate: string | null
                    status: 'active' | 'maintenance' | 'out_of_service' | 'calibration_due'
                    created_at: string
                    updated_at: string | null
                    created_by: string | null
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    factory_id?: string | null
                    code: string
                    name: string
                    model?: string | null
                    serial_number?: string | null
                    setpoint_temp_c: number
                    temp_tolerance?: number
                    capacity_plates?: number | null
                    capacity_shelves?: number | null
                    last_calibration_date?: string | null
                    next_calibration_date?: string | null
                    calibration_certificate?: string | null
                    status?: 'active' | 'maintenance' | 'out_of_service' | 'calibration_due'
                    created_at?: string
                    updated_at?: string | null
                    created_by?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    factory_id?: string | null
                    code?: string
                    name?: string
                    model?: string | null
                    serial_number?: string | null
                    setpoint_temp_c?: number
                    temp_tolerance?: number
                    capacity_plates?: number | null
                    capacity_shelves?: number | null
                    last_calibration_date?: string | null
                    next_calibration_date?: string | null
                    calibration_certificate?: string | null
                    status?: 'active' | 'maintenance' | 'out_of_service' | 'calibration_due'
                    created_at?: string
                    updated_at?: string | null
                    created_by?: string | null
                }
            }
            micro_test_sessions: {
                Row: {
                    id: string
                    tenant_id: string
                    incubator_id: string | null
                    session_code: string
                    started_at: string
                    expected_end_at: string | null
                    actual_end_at: string | null
                    target_temp_c: number | null
                    min_temp_recorded: number | null
                    max_temp_recorded: number | null
                    avg_temp_recorded: number | null
                    status: 'incubating' | 'reading' | 'completed' | 'aborted'
                    started_by: string | null
                    completed_by: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    incubator_id?: string | null
                    session_code: string
                    started_at?: string
                    expected_end_at?: string | null
                    actual_end_at?: string | null
                    target_temp_c?: number | null
                    min_temp_recorded?: number | null
                    max_temp_recorded?: number | null
                    avg_temp_recorded?: number | null
                    status?: 'incubating' | 'reading' | 'completed' | 'aborted'
                    started_by?: string | null
                    completed_by?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    incubator_id?: string | null
                    session_code?: string
                    started_at?: string
                    expected_end_at?: string | null
                    actual_end_at?: string | null
                    target_temp_c?: number | null
                    min_temp_recorded?: number | null
                    max_temp_recorded?: number | null
                    avg_temp_recorded?: number | null
                    status?: 'incubating' | 'reading' | 'completed' | 'aborted'
                    started_by?: string | null
                    completed_by?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string | null
                }
            }
            micro_results: {
                Row: {
                    id: string
                    tenant_id: string
                    sample_id: string
                    parameter_id: string
                    test_session_id: string | null
                    media_lot_id: string | null
                    result_type: 'count' | 'tntc' | 'presence' | 'absence'
                    colony_count: number | null
                    dilution_factor: number
                    cfu_per_ml: number | null
                    is_detected: boolean | null
                    spec_limit: number | null
                    spec_unit: string
                    is_conform: boolean | null
                    deviation_percentage: number | null
                    incubation_hours: number | null
                    analysis_date: string | null
                    read_by: string | null
                    verified_by: string | null
                    verified_at: string | null
                    verification_status: 'pending' | 'verified' | 'rejected'
                    notes: string | null
                    attachments: Record<string, unknown>[]
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    sample_id: string
                    parameter_id: string
                    test_session_id?: string | null
                    media_lot_id?: string | null
                    result_type: 'count' | 'tntc' | 'presence' | 'absence'
                    colony_count?: number | null
                    dilution_factor?: number
                    cfu_per_ml?: number | null
                    is_detected?: boolean | null
                    spec_limit?: number | null
                    spec_unit?: string
                    is_conform?: boolean | null
                    deviation_percentage?: number | null
                    incubation_hours?: number | null
                    analysis_date?: string | null
                    read_by?: string | null
                    verified_by?: string | null
                    verified_at?: string | null
                    verification_status?: 'pending' | 'verified' | 'rejected'
                    notes?: string | null
                    attachments?: Record<string, unknown>[]
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    sample_id?: string
                    parameter_id?: string
                    test_session_id?: string | null
                    media_lot_id?: string | null
                    result_type?: 'count' | 'tntc' | 'presence' | 'absence'
                    colony_count?: number | null
                    dilution_factor?: number
                    cfu_per_ml?: number | null
                    is_detected?: boolean | null
                    spec_limit?: number | null
                    spec_unit?: string
                    is_conform?: boolean | null
                    deviation_percentage?: number | null
                    incubation_hours?: number | null
                    analysis_date?: string | null
                    read_by?: string | null
                    verified_by?: string | null
                    verified_at?: string | null
                    verification_status?: 'pending' | 'verified' | 'rejected'
                    notes?: string | null
                    attachments?: Record<string, unknown>[]
                    created_at?: string
                    updated_at?: string | null
                }
            }
            // =====================================================
            // SAMPLING POINTS
            // =====================================================
            sampling_points: {
                Row: {
                    id: string
                    tenant_id: string
                    factory_id: string | null
                    code: string
                    name: string
                    description: string | null
                    location: string | null
                    area: string | null
                    equipment_id: string | null
                    allowed_sample_types: string[]
                    is_active: boolean
                    created_at: string
                    updated_at: string | null
                    created_by: string | null
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    factory_id?: string | null
                    code: string
                    name: string
                    description?: string | null
                    location?: string | null
                    area?: string | null
                    equipment_id?: string | null
                    allowed_sample_types?: string[]
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string | null
                    created_by?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    factory_id?: string | null
                    code?: string
                    name?: string
                    description?: string | null
                    location?: string | null
                    area?: string | null
                    equipment_id?: string | null
                    allowed_sample_types?: string[]
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string | null
                    created_by?: string | null
                }
            }
            // =====================================================
            // CIP MODULE
            // =====================================================
            cip_programs: {
                Row: {
                    id: string
                    tenant_id: string
                    code: string
                    name: string
                    description: string | null
                    target_equipment_type: string
                    total_duration_minutes: number | null
                    is_active: boolean
                    version: number
                    created_at: string
                    updated_at: string | null
                    created_by: string | null
                    approved_by: string | null
                    approved_at: string | null
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    code: string
                    name: string
                    description?: string | null
                    target_equipment_type: string
                    total_duration_minutes?: number | null
                    is_active?: boolean
                    version?: number
                    created_at?: string
                    updated_at?: string | null
                    created_by?: string | null
                    approved_by?: string | null
                    approved_at?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    code?: string
                    name?: string
                    description?: string | null
                    target_equipment_type?: string
                    total_duration_minutes?: number | null
                    is_active?: boolean
                    version?: number
                    created_at?: string
                    updated_at?: string | null
                    created_by?: string | null
                    approved_by?: string | null
                    approved_at?: string | null
                }
            }
            cip_program_steps: {
                Row: {
                    id: string
                    tenant_id: string
                    program_id: string
                    step_order: number
                    step_name: string
                    target_temp_min: number | null
                    target_temp_max: number | null
                    target_duration_seconds: number
                    target_concentration: number | null
                    target_conductivity_min: number | null
                    target_conductivity_max: number | null
                    chemical_type: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    program_id: string
                    step_order: number
                    step_name: string
                    target_temp_min?: number | null
                    target_temp_max?: number | null
                    target_duration_seconds: number
                    target_concentration?: number | null
                    target_conductivity_min?: number | null
                    target_conductivity_max?: number | null
                    chemical_type?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    program_id?: string
                    step_order?: number
                    step_name?: string
                    target_temp_min?: number | null
                    target_temp_max?: number | null
                    target_duration_seconds?: number
                    target_concentration?: number | null
                    target_conductivity_min?: number | null
                    target_conductivity_max?: number | null
                    chemical_type?: string | null
                    created_at?: string
                }
            }
            cip_executions: {
                Row: {
                    id: string
                    tenant_id: string
                    program_id: string
                    equipment_id: string
                    execution_code: string
                    started_at: string
                    completed_at: string | null
                    status: 'in_progress' | 'completed' | 'failed' | 'aborted'
                    overall_result: 'pass' | 'fail' | 'deviation' | null
                    performed_by: string | null
                    verified_by: string | null
                    verified_at: string | null
                    notes: string | null
                    deviation_notes: string | null
                    valid_until: string | null
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    program_id: string
                    equipment_id: string
                    execution_code: string
                    started_at?: string
                    completed_at?: string | null
                    status?: 'in_progress' | 'completed' | 'failed' | 'aborted'
                    overall_result?: 'pass' | 'fail' | 'deviation' | null
                    performed_by?: string | null
                    verified_by?: string | null
                    verified_at?: string | null
                    notes?: string | null
                    deviation_notes?: string | null
                    valid_until?: string | null
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    program_id?: string
                    equipment_id?: string
                    execution_code?: string
                    started_at?: string
                    completed_at?: string | null
                    status?: 'in_progress' | 'completed' | 'failed' | 'aborted'
                    overall_result?: 'pass' | 'fail' | 'deviation' | null
                    performed_by?: string | null
                    verified_by?: string | null
                    verified_at?: string | null
                    notes?: string | null
                    deviation_notes?: string | null
                    valid_until?: string | null
                    created_at?: string
                    updated_at?: string | null
                }
            }
            cip_execution_steps: {
                Row: {
                    id: string
                    tenant_id: string
                    execution_id: string
                    program_step_id: string
                    step_order: number
                    actual_temp_avg: number | null
                    actual_temp_min: number | null
                    actual_temp_max: number | null
                    actual_duration_seconds: number | null
                    actual_conductivity_avg: number | null
                    actual_conductivity_min: number | null
                    actual_conductivity_max: number | null
                    started_at: string | null
                    ended_at: string | null
                    status: 'pending' | 'pass' | 'fail' | 'skipped'
                    deviation_reason: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    tenant_id: string
                    execution_id: string
                    program_step_id: string
                    step_order: number
                    actual_temp_avg?: number | null
                    actual_temp_min?: number | null
                    actual_temp_max?: number | null
                    actual_duration_seconds?: number | null
                    actual_conductivity_avg?: number | null
                    actual_conductivity_min?: number | null
                    actual_conductivity_max?: number | null
                    started_at?: string | null
                    ended_at?: string | null
                    status?: 'pending' | 'pass' | 'fail' | 'skipped'
                    deviation_reason?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    tenant_id?: string
                    execution_id?: string
                    program_step_id?: string
                    step_order?: number
                    actual_temp_avg?: number | null
                    actual_temp_min?: number | null
                    actual_temp_max?: number | null
                    actual_duration_seconds?: number | null
                    actual_conductivity_avg?: number | null
                    actual_conductivity_min?: number | null
                    actual_conductivity_max?: number | null
                    started_at?: string | null
                    ended_at?: string | null
                    status?: 'pending' | 'pass' | 'fail' | 'skipped'
                    deviation_reason?: string | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}


// Type helpers
export type ProductionLotStatus = Database['public']['Tables']['production_lots']['Row']['status']
export type SampleStatus = Database['public']['Tables']['samples']['Row']['status']
export type NCStatus = Database['public']['Tables']['non_conformities']['Row']['status']
