import { createClient } from "@/lib/supabase/client";
import { ProductionLot, IntermediateLot, FinishedLot } from "@/types/production";

export interface GenealogyChain {
    production_lot?: ProductionLot;
    intermediate_lots: IntermediateLot[];
    finished_lots: FinishedLot[];
}

/**
 * Traces the complete genealogy starting from a production lot
 */
export async function traceFromProductionLot(productionLotId: string): Promise<GenealogyChain> {
    const supabase = createClient();

    // Fetch production lot
    const { data: productionLot, error: prodError } = await supabase
        .from("production_lots")
        .select("*, product:products(*)")
        .eq("id", productionLotId)
        .single();

    if (prodError) throw prodError;

    // Fetch all intermediate lots for this production lot
    const { data: intermediateLots, error: intError } = await supabase
        .from("intermediate_lots")
        .select("*")
        .eq("production_lot_id", productionLotId);

    if (intError) throw intError;

    // Fetch all finished lots for these intermediate lots
    const intermediateIds = (intermediateLots || []).map(lot => lot.id);
    let finishedLots: FinishedLot[] = [];

    if (intermediateIds.length > 0) {
        const { data: finData, error: finError } = await supabase
            .from("finished_lots")
            .select("*")
            .in("intermediate_lot_id", intermediateIds);

        if (finError) throw finError;
        finishedLots = finData || [];
    }

    return {
        production_lot: productionLot as ProductionLot,
        intermediate_lots: intermediateLots || [],
        finished_lots: finishedLots
    };
}

/**
 * Traces backward from a finished lot to its origin
 */
export async function traceFromFinishedLot(finishedLotId: string): Promise<GenealogyChain> {
    const supabase = createClient();

    // Fetch finished lot with its intermediate lot
    const { data: finishedLot, error: finError } = await supabase
        .from("finished_lots")
        .select(`
      *,
      intermediate_lot:intermediate_lots(
        *,
        production_lot:production_lots(*, product:products(*))
      )
    `)
        .eq("id", finishedLotId)
        .single();

    if (finError) throw finError;

    const intermediateLot = (finishedLot as any).intermediate_lot;
    const productionLot = intermediateLot?.production_lot;

    // Fetch all sibling intermediate lots
    let intermediateLots: IntermediateLot[] = [];
    if (productionLot) {
        const { data: intData } = await supabase
            .from("intermediate_lots")
            .select("*")
            .eq("production_lot_id", productionLot.id);

        intermediateLots = intData || [];
    }

    // Fetch all sibling finished lots
    const intermediateIds = intermediateLots.map(lot => lot.id);
    let finishedLots: FinishedLot[] = [];

    if (intermediateIds.length > 0) {
        const { data: finData } = await supabase
            .from("finished_lots")
            .select("*")
            .in("intermediate_lot_id", intermediateIds);

        finishedLots = finData || [];
    }

    return {
        production_lot: productionLot,
        intermediate_lots: intermediateLots,
        finished_lots: finishedLots
    };
}

/**
 * Searches for lots by code across all entity types
 */
export async function searchLotByCode(code: string) {
    const supabase = createClient();

    const [prodResult, intResult, finResult] = await Promise.all([
        supabase.from("production_lots").select("*, product:products(*)").ilike("code", `%${code}%`),
        supabase.from("intermediate_lots").select("*").ilike("code", `%${code}%`),
        supabase.from("finished_lots").select("*").ilike("code", `%${code}%`)
    ]);

    return {
        production_lots: prodResult.data || [],
        intermediate_lots: intResult.data || [],
        finished_lots: finResult.data || []
    };
}
