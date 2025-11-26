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
                }
            }
            samples: {
                Row: {
                    id: string
                    code: string
                    sample_type: string
                    status: 'pending' | 'in_analysis' | 'under_review' | 'approved' | 'rejected'
                    collected_at: string
                    product_id: string | null
                    production_lot_id: string | null
                    assigned_to: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string | null
                    updated_by: string | null
                    tenant_id: string | null
                }
                Insert: {
                    id?: string
                    code: string
                    sample_type: string
                    status?: 'pending' | 'in_analysis' | 'under_review' | 'approved' | 'rejected'
                    collected_at: string
                    product_id?: string | null
                    production_lot_id?: string | null
                    assigned_to?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string | null
                    updated_by?: string | null
                    tenant_id?: string | null
                }
                Update: {
                    id?: string
                    code?: string
                    sample_type?: string
                    status?: 'pending' | 'in_analysis' | 'under_review' | 'approved' | 'rejected'
                    collected_at?: string
                    product_id?: string | null
                    production_lot_id?: string | null
                    assigned_to?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string | null
                    updated_by?: string | null
                    tenant_id?: string | null
                }
            }
            non_conformities: {
                Row: {
                    id: string
                    nc_number: string | null
                    type: string
                    status: 'draft' | 'open' | 'investigating' | 'pending_approval' | 'approved' | 'rejected' | 'closed'
                    opened_by: string | null
                    created_at: string
                    updated_at: string | null
                    updated_by: string | null
                    tenant_id: string | null
                }
                Insert: {
                    id?: string
                    nc_number?: string | null
                    type: string
                    status?: 'draft' | 'open' | 'investigating' | 'pending_approval' | 'approved' | 'rejected' | 'closed'
                    opened_by?: string | null
                    created_at?: string
                    updated_at?: string | null
                    updated_by?: string | null
                    tenant_id?: string | null
                }
                Update: {
                    id?: string
                    nc_number?: string | null
                    type?: string
                    status?: 'draft' | 'open' | 'investigating' | 'pending_approval' | 'approved' | 'rejected' | 'closed'
                    opened_by?: string | null
                    created_at?: string
                    updated_at?: string | null
                    updated_by?: string | null
                    tenant_id?: string | null
                }
            }
        }
    }
}

// Type helpers
export type ProductionLotStatus = Database['public']['Tables']['production_lots']['Row']['status']
export type SampleStatus = Database['public']['Tables']['samples']['Row']['status']
export type NCStatus = Database['public']['Tables']['non_conformities']['Row']['status']
