import { createClient } from "@/lib/supabase/client";

export interface ReagentStockMovement {
    id: string;
    reagent_id: string;
    batch_id?: string;
    movement_type: 'entry' | 'withdrawal' | 'return' | 'adjustment' | 'waste' | 'transfer';
    quantity: number;
    unit: string;

    // Entry fields
    supplier_name?: string;
    purchase_order?: string;
    invoice_number?: string;
    cost?: number;

    // Withdrawal fields
    requisition_number?: string;
    requester_id?: string;
    department?: string;
    purpose?: string;

    // Return fields
    returned_quantity?: number;
    return_reason?: string;

    // Locations
    from_location?: string;
    to_location?: string;

    // Status
    status: 'pending' | 'approved' | 'completed' | 'cancelled';

    // Approval
    approved_by?: string;
    approved_at?: string;

    // Who and when
    performed_by?: string;
    performed_at: string;

    notes?: string;
    created_at: string;
}

export interface ReagentStockMovementWithDetails extends ReagentStockMovement {
    reagent?: {
        code: string;
        name: string;
    };
    requester?: {
        full_name: string;
    };
    approval?: {
        full_name: string;
    };
}

// ============================================================================
// STOCK MOVEMENTS - ENTRIES & WITHDRAWALS
// ============================================================================

export async function recordEntry(entry: {
    reagent_id: string;
    batch_id?: string;
    quantity: number;
    unit: string;
    supplier_name?: string;
    purchase_order?: string;
    invoice_number?: string;
    cost?: number;
    notes?: string;
}) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagent_stock_movements")
        .insert({
            ...entry,
            movement_type: 'entry',
            status: 'completed',
        })
        .select()
        .single();

    if (error) throw error;
    return data as ReagentStockMovement;
}

export async function recordWithdrawal(withdrawal: {
    reagent_id: string;
    batch_id?: string;
    quantity: number;
    unit: string;
    requisition_number?: string;
    requester_id?: string;
    department?: string;
    purpose?: string;
    from_location?: string;
    notes?: string;
}) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagent_stock_movements")
        .insert({
            ...withdrawal,
            movement_type: 'withdrawal',
            status: 'completed',
        })
        .select()
        .single();

    if (error) throw error;

    // Update batch quantity if batch_id provided
    if (withdrawal.batch_id) {
        const { data: batch } = await supabase
            .from("reagent_batches")
            .select("quantity_remaining")
            .eq("id", withdrawal.batch_id)
            .single();

        if (batch) {
            await supabase
                .from("reagent_batches")
                .update({
                    quantity_remaining: batch.quantity_remaining - withdrawal.quantity
                })
                .eq("id", withdrawal.batch_id);
        }
    }

    return data as ReagentStockMovement;
}

export async function recordReturn(returnData: {
    reagent_id: string;
    batch_id?: string;
    quantity: number;
    unit: string;
    return_reason?: string;
    to_location?: string;
    notes?: string;
}) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagent_stock_movements")
        .insert({
            ...returnData,
            movement_type: 'return',
            status: 'completed',
        })
        .select()
        .single();

    if (error) throw error;

    // Update batch quantity if batch_id provided (add back)
    if (returnData.batch_id) {
        const { data: batch } = await supabase
            .from("reagent_batches")
            .select("quantity_remaining")
            .eq("id", returnData.batch_id)
            .single();

        if (batch) {
            await supabase
                .from("reagent_batches")
                .update({
                    quantity_remaining: batch.quantity_remaining + returnData.quantity
                })
                .eq("id", returnData.batch_id);
        }
    }

    return data as ReagentStockMovement;
}

export async function getStockMovements(reagentId: string, limit = 50): Promise<ReagentStockMovementWithDetails[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagent_stock_movements")
        .select(`
            *,
            reagent:reagents(code, name),
            requester:profiles!requester_id(full_name),
            approver:profiles!approved_by(full_name)
        `)
        .eq("reagent_id", reagentId)
        .order("performed_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data as ReagentStockMovementWithDetails[];
}

export async function getAllRecentMovements(limit = 100): Promise<ReagentStockMovementWithDetails[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagent_stock_movements")
        .select(`
            *,
            reagent:reagents(code, name),
            requester:profiles!requester_id(full_name)
        `)
        .order("performed_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data as ReagentStockMovementWithDetails[];
}

export async function getMovementsByType(
    movementType: 'entry' | 'withdrawal' | 'return',
    limit = 50
): Promise<ReagentStockMovementWithDetails[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("reagent_stock_movements")
        .select(`
            *,
            reagent:reagents(code, name),
            requester:profiles!requester_id(full_name)
        `)
        .eq("movement_type", movementType)
        .order("performed_at", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data as ReagentStockMovementWithDetails[];
}
