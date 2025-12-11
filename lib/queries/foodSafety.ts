import { createClient } from "@/lib/supabase/client";
import { auditCreate, auditUpdate } from "@/lib/utils/audit-helper";
import { captureSignature } from "@/lib/e-signature";
import { requireRole } from "@/lib/rbac";
import { FoodSafetyPayload, FoodSafetyRecord, FoodSafetyStatus, FoodSafetyType } from "@/types/foodSafety";

const TABLES: Record<FoodSafetyType, string> = {
    prp: "food_safety_prp",
    oprp: "food_safety_oprp",
    pcc: "food_safety_pcc",
};

function getTable(type: FoodSafetyType) {
    return TABLES[type];
}

export async function listFoodSafetyItems(type: FoodSafetyType): Promise<FoodSafetyRecord[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from(getTable(type))
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as FoodSafetyRecord[];
}

export async function createFoodSafetyItem(
    type: FoodSafetyType,
    payload: Omit<FoodSafetyPayload, "status"> & { status?: FoodSafetyStatus }
): Promise<FoodSafetyRecord> {
    const supabase = createClient();
    const body = { ...payload, status: payload.status || "open" };

    const { data, error } = await supabase
        .from(getTable(type))
        .insert(body)
        .select()
        .single();

    if (error) throw error;

    await auditCreate(getTable(type), data.id, body);
    return data as FoodSafetyRecord;
}

export async function updateFoodSafetyItem(
    type: FoodSafetyType,
    id: string,
    updates: Partial<FoodSafetyPayload>
): Promise<FoodSafetyRecord> {
    const supabase = createClient();
    const table = getTable(type);

    const { data: existing, error: fetchError } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError) throw fetchError;

    if (updates.status === "closed" || updates.status === "breach") {
        await requireRole(["manager", "supervisor", "admin"]);
    }

    const { data, error } = await supabase
        .from(table)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    await auditUpdate(table, id, existing || {}, data || {});
    return data as FoodSafetyRecord;
}

export async function logMonitoringEvent(
    type: FoodSafetyType,
    id: string,
    evidence: string,
    immediateActions: string,
    status: FoodSafetyStatus = "monitoring"
): Promise<FoodSafetyRecord> {
    const supabase = createClient();
    const table = getTable(type);

    const { data: existing, error: fetchError } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError) throw fetchError;

    if (status === "breach") {
        await requireRole(["manager", "supervisor", "admin"]);
    }

    const { data, error } = await supabase
        .from(table)
        .update({
            evidence,
            immediate_actions: immediateActions,
            status,
            last_check: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    await auditUpdate(table, id, existing || {}, data || {});
    return data as FoodSafetyRecord;
}

export async function closeFoodSafetyItem(
    type: FoodSafetyType,
    id: string,
    comment: string,
    password: string
): Promise<FoodSafetyRecord> {
    await requireRole(["manager", "supervisor", "admin"]);
    const supabase = createClient();
    const table = getTable(type);

    const { data: existing, error: fetchError } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
        .from(table)
        .update({
            status: "closed",
            closing_comment: comment,
            closed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    const signatureResult = await captureSignature(password, "approved", table, id, comment || "Approved");
    if (!signatureResult.success) {
        throw new Error(signatureResult.error || "Failed to capture signature");
    }

    await auditUpdate(table, id, existing || {}, data || {});
    return data as FoodSafetyRecord;
}

export async function countPCCBreaches(): Promise<number> {
    const supabase = createClient();
    const { count } = await supabase
        .from(getTable("pcc"))
        .select("id", { count: "exact", head: true })
        .eq("status", "breach");

    return count ?? 0;
}
