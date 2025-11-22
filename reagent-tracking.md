ntation Plan: Reagent Management & Stock Control Module
Created: 2025-11-22
Module: Laboratory Reagent & Chemical Management
Estimated Time: 2-3 days

Executive Summary
Implement a comprehensive reagent and chemical management system for laboratory operations including:

Reagent catalog and inventory
Stock level tracking with min/max alerts
Expiration date monitoring
Batch/lot tracking
Usage history and consumption patterns
Barcode/QR code support (future)
Current State Analysis
Existing Infrastructure
✅ Database Table: reagents table exists (verified from RLS policies)
✅ Type Definition: 
types/reagent.ts
 exists
❌ Query Functions: None (lib/queries/ - no reagent queries)
❌ UI Pages: No reagent management pages
❌ Stock Control: Not implemented

Database Verification Required
Execute 06_check_reagents.sql to analyze:

Table structure and columns
Existing data
RLS policies
Related tables (reagent_batches, reagent_usage, etc.)
Phase 1: Database Schema Enhancement (30 min)
Step 1.1: Verify & Enhance Reagents Table
Expected Columns:

CREATE TABLE IF NOT EXISTS public.reagents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    code TEXT UNIQUE NOT NULL, -- e.g., REG-001
    name TEXT NOT NULL,
    cas_number TEXT, -- Chemical Abstract Service number
    formula TEXT, -- Chemical formula
    category TEXT NOT NULL, -- acid, base, indicator, solvent, buffer, standard
    
    -- Supplier Info
    supplier_id UUID REFERENCES suppliers(id),
    catalog_number TEXT,
    manufacturer TEXT,
    
    -- Storage & Safety
    storage_location TEXT NOT NULL,
    storage_temp_min NUMERIC,
    storage_temp_max NUMERIC,
    hazard_class TEXT, -- flammable, corrosive, toxic, oxidizer, etc
    safety_data_sheet_url TEXT,
    
    -- Stock Control
    unit TEXT NOT NULL DEFAULT 'L', -- L, mL, kg, g, units
    stock_current NUMERIC DEFAULT 0,
    stock_min NUMERIC DEFAULT 0, -- Reorder point
    stock_max NUMERIC,
    cost_per_unit NUMERIC,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'restricted')),
    
    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
If table structure is different, create migration:

20251123_enhance_reagents_table.sql
Step 1.2: Create Reagent Batches Table
Track individual batches/lots with expiration dates:

File: 20251123_create_reagent_batches.sql

CREATE TABLE IF NOT EXISTS public.reagent_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reagent_id UUID NOT NULL REFERENCES reagents(id) ON DELETE CASCADE,
    
    -- Batch Info
    batch_number TEXT NOT NULL,
    lot_number TEXT,
    
    -- Receipt
    received_date DATE NOT NULL DEFAULT CURRENT_DATE,
    received_quantity NUMERIC NOT NULL,
    received_by UUID REFERENCES profiles(id),
    
    -- Expiration
    manufacture_date DATE,
    expiration_date DATE,
    opened_date DATE, -- When container was first opened
    
    -- Stock
    quantity_remaining NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    
    -- Quality
    qc_status TEXT DEFAULT 'pending' CHECK (qc_status IN ('pending', 'approved', 'rejected', 'expired')),
    qc_tested_by UUID REFERENCES profiles(id),
    qc_tested_at TIMESTAMP WITH TIME ZONE,
    qc_notes TEXT,
    
    -- Traceability
    purchase_order TEXT,
    invoice_number TEXT,
    cost NUMERIC,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(reagent_id, batch_number)
);
CREATE INDEX idx_reagent_batches_reagent ON reagent_batches(reagent_id);
CREATE INDEX idx_reagent_batches_expiration ON reagent_batches(expiration_date);
CREATE INDEX idx_reagent_batches_qc_status ON reagent_batches(qc_status);
Step 1.3: Create Reagent Usage Log
Track all reagent consumption:

File: 20251123_create_reagent_usage.sql

CREATE TABLE IF NOT EXISTS public.reagent_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What was used
    reagent_id UUID NOT NULL REFERENCES reagents(id),
    batch_id UUID REFERENCES reagent_batches(id),
    
    -- How much
    quantity_used NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    
    -- Context
    usage_type TEXT NOT NULL CHECK (usage_type IN ('analysis', 'preparation', 'calibration', 'cleaning', 'waste', 'other')),
    related_sample_id UUID, -- Link to sample if applicable
    related_analysis_id UUID, -- Link to lab_analysis if applicable
    
    -- Who and when
    used_by UUID REFERENCES profiles(id),
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Notes
    purpose TEXT,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_reagent_usage_reagent ON reagent_usage(reagent_id);
CREATE INDEX idx_reagent_usage_batch ON reagent_usage(batch_id);
CREATE INDEX idx_reagent_usage_used_at ON reagent_usage(used_at);
CREATE INDEX idx_reagent_usage_used_by ON reagent_usage(used_by);
Phase 2: Type Definitions (15 min)
Step 2.1: Enhance Reagent Types
File: types/reagent.ts

export interface Reagent {
    id: string;
    code: string;
    name: string;
    cas_number?: string;
    formula?: string;
    category: 'acid' | 'base' | 'indicator' | 'solvent' | 'buffer' | 'standard' | 'other';
    
    // Supplier
    supplier_id?: string;
    catalog_number?: string;
    manufacturer?: string;
    
    // Storage
    storage_location: string;
    storage_temp_min?: number;
    storage_temp_max?: number;
    hazard_class?: 'flammable' | 'corrosive' | 'toxic' | 'oxidizer' | 'explosive';
    safety_data_sheet_url?: string;
    
    // Stock
    unit: string;
    stock_current: number;
    stock_min: number;
    stock_max?: number;
    cost_per_unit?: number;
    
    status: 'active' | 'discontinued' | 'restricted';
    
    created_by?: string;
    created_at: string;
    updated_at: string;
}
export interface ReagentBatch {
    id: string;
    reagent_id: string;
    batch_number: string;
    lot_number?: string;
    
    received_date: string;
    received_quantity: number;
    received_by?: string;
    
    manufacture_date?: string;
    expiration_date?: string;
    opened_date?: string;
    
    quantity_remaining: number;
    unit: string;
    
    qc_status: 'pending' | 'approved' | 'rejected' | 'expired';
    qc_tested_by?: string;
    qc_tested_at?: string;
    qc_notes?: string;
    
    purchase_order?: string;
    invoice_number?: string;
    cost?: number;
    
    created_at: string;
    updated_at: string;
}
export interface ReagentUsage {
    id: string;
    reagent_id: string;
    batch_id?: string;
    quantity_used: number;
    unit: string;
    usage_type: 'analysis' | 'preparation' | 'calibration' | 'cleaning' | 'waste' | 'other';
    related_sample_id?: string;
    related_analysis_id?: string;
    used_by?: string;
    used_at: string;
    purpose?: string;
    notes?: string;
    created_at: string;
}
export interface ReagentWithStock extends Reagent {
    batches?: ReagentBatch[];
    total_batches?: number;
    expiring_soon_count?: number;
    low_stock?: boolean;
}
Phase 3: Query Functions (45 min)
Step 3.1: Reagent CRUD Operations
File: lib/queries/reagents.ts

import { createClient } from "@/lib/supabase/client";
import { Reagent, ReagentBatch, ReagentUsage, ReagentWithStock } from "@/types/reagent";
// ============================================================================
// REAGENTS
// ============================================================================
export async function getReagents(): Promise<ReagentWithStock[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagents")
        .select(`
            *,
            batches:reagent_batches(count),
            supplier:suppliers(name)
        `)
        .order("name");
    if (error) throw error;
    
    // Calculate stock status
    return (data as any[]).map(r => ({
        ...r,
        total_batches: r.batches?.[0]?.count || 0,
        low_stock: r.stock_current <= r.stock_min,
    }));
}
export async function getReagentById(id: string): Promise<ReagentWithStock> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagents")
        .select(`
            *,
            batches:reagent_batches(*),
            supplier:suppliers(name, contact)
        `)
        .eq("id", id)
        .single();
    if (error) throw error;
    
    // Count expiring soon (within 30 days)
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 30);
    
    return {
        ...data,
        expiring_soon_count: data.batches?.filter((b: ReagentBatch) => 
            b.expiration_date && new Date(b.expiration_date) <= expiringDate
        ).length || 0
    };
}
export async function createReagent(reagent: Omit<Reagent, "id" | "created_at" | "updated_at">) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagents")
        .insert(reagent)
        .select()
        .single();
    if (error) throw error;
    return data as Reagent;
}
export async function updateReagent(id: string, updates: Partial<Reagent>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
    if (error) throw error;
    return data as Reagent;
}
export async function deleteReagent(id: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from("reagents")
        .delete()
        .eq("id", id);
    if (error) throw error;
}
// ============================================================================
// BATCHES
// ============================================================================
export async function getBatchesByReagent(reagentId: string): Promise<ReagentBatch[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagent_batches")
        .select("*")
        .eq("reagent_id", reagentId)
        .order("expiration_date", { ascending: true });
    if (error) throw error;
    return data as ReagentBatch[];
}
export async function createBatch(batch: Omit<ReagentBatch, "id" | "created_at" | "updated_at">) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagent_batches")
        .insert(batch)
        .select()
        .single();
    if (error) throw error;
    
    // Update reagent stock
    await updateReagentStock(batch.reagent_id);
    
    return data as ReagentBatch;
}
export async function updateBatch(id: string, updates: Partial<ReagentBatch>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagent_batches")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
    if (error) throw error;
    
    // Update reagent stock
    if (data) await updateReagentStock(data.reagent_id);
    
    return data as ReagentBatch;
}
// ============================================================================
// USAGE TRACKING
// ============================================================================
export async function recordUsage(usage: Omit<ReagentUsage, "id" | "created_at">) {
    const supabase = createClient();
    
    // Insert usage record
    const { data, error } = await supabase
        .from("reagent_usage")
        .insert(usage)
        .select()
        .single();
    if (error) throw error;
    
    // Update batch quantity if batch_id provided
    if (usage.batch_id) {
        const { data: batch } = await supabase
            .from("reagent_batches")
            .select("quantity_remaining, reagent_id")
            .eq("id", usage.batch_id)
            .single();
        
        if (batch) {
            await supabase
                .from("reagent_batches")
                .update({ 
                    quantity_remaining: batch.quantity_remaining - usage.quantity_used 
                })
                .eq("id", usage.batch_id);
            
            await updateReagentStock(batch.reagent_id);
        }
    }
    
    return data as ReagentUsage;
}
export async function getUsageHistory(reagentId: string, limit = 50): Promise<ReagentUsage[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagent_usage")
        .select(`
            *,
            user:profiles!used_by(full_name),
            batch:reagent_batches(batch_number)
        `)
        .eq("reagent_id", reagentId)
        .order("used_at", { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data as ReagentUsage[];
}
// ============================================================================
// STOCK MANAGEMENT
// ============================================================================
async function updateReagentStock(reagentId: string) {
    const supabase = createClient();
    
    // Calculate total stock from all batches
    const { data: batches } = await supabase
        .from("reagent_batches")
        .select("quantity_remaining")
        .eq("reagent_id", reagentId)
        .eq("qc_status", "approved");
    
    const totalStock = batches?.reduce((sum, b) => sum + (b.quantity_remaining || 0), 0) || 0;
    
    await supabase
        .from("reagents")
        .update({ stock_current: totalStock })
        .eq("id", reagentId);
}
export async function getLowStockReagents(): Promise<ReagentWithStock[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagents")
        .select("*")
        .or("stock_current.lte.stock_min")
        .eq("status", "active")
        .order("stock_current", { ascending: true });
    if (error) throw error;
    return data as ReagentWithStock[];
}
export async function getExpiringBatches(days = 30): Promise<ReagentBatch[]> {
    const supabase = createClient();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const { data, error } = await supabase
        .from("reagent_batches")
        .select(`
            *,
            reagent:reagents(name, code)
        `)
        .lte("expiration_date", futureDate.toISOString().split('T')[0])
        .eq("qc_status", "approved")
        .order("expiration_date", { ascending: true });
    if (error) throw error;
    return data as ReagentBatch[];
}
Phase 4: UI Implementation (2-3 hours)
Step 4.1: Main Reagents Page
File: app/reagents/page.tsx

Features:

List all reagents in table
Search and filter (by category, status, low stock)
Stock level indicators
Expiration alerts
Add new reagent button
Quick actions (edit, view batches, record usage)
Step 4.2: Reagent Detail Page
File: app/reagents/[id]/page.tsx

Features:

Reagent info card
Stock overview with chart
Batch list with expiration dates
Usage history chart
Quick actions (receive batch, record usage)
Step 4.3: Batch Management Dialog
Component: components/reagents/BatchDialog.tsx

Features:

Receive new batch form
Batch details (lot, expiration, QC status)
Update quantity remaining
Step 4.4: Usage Recording Dialog
Component: components/reagents/UsageDialog.tsx

Features:

Select batch (FIFO recommended)
Enter quantity used
Usage type and purpose
Link to sample/analysis (optional)
Phase 5: Dashboard Integration (30 min)
Add Reagent Widgets to Dashboard
Low Stock Alert Card

Count of reagents below min stock
Link to filtered list
Expiring Soon Card

Count of batches expiring in 30 days
Link to batch list
Recent Usage Chart

Top 10 most used reagents this month
Implementation Checklist
Database (Day 1 Morning)
 Execute 06_check_reagents.sql verification
 Create/update reagents table migration
 Create reagent_batches table
 Create reagent_usage table
 Add RLS policies
 Test migrations
Backend (Day 1 Afternoon)
 Enhance types/reagent.ts
 Create lib/queries/reagents.ts
 Test query functions
 Add unit tests
Frontend (Day 2)
 Create /reagents list page
 Create /reagents/[id] detail page
 Build BatchDialog component
 Build UsageDialog component
 Add search and filters
Integration (Day 3 Morning)
 Add dashboard widgets
 Link from sidebar
 Test all flows
 Add seed data
Polish (Day 3 Afternoon)
 Add loading states
 Error handling
 Validation
 Documentation
Success Criteria
✅ All reagents with stock levels visible
✅ Can add/edit/delete reagents
✅ Can receive new batches
✅ Can record usage and track consumption
✅ Low stock alerts working
✅ Expiration warnings working
✅ Stock automatically calculated
✅ Usage history tracked
Future Enhancements
Barcode/QR code scanning
Automatic reorder suggestions
Integration with purchasing
Reagent compatibility matrix
Cost tracking and budgeting
Mobile app for stock taking