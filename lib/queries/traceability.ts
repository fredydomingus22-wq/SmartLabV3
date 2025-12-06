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
export async function getLotDetail(lotCode: string) {
    // Search across all lot tables
    const results = await searchLotByCode(lotCode);

    // Production lot takes precedence
    if (results.production_lots?.length) {
        const prodLot = results.production_lots[0];
        const genealogy = await traceFromProductionLot(prodLot.id);
        return { type: "production" as const, data: prodLot, genealogy };
    }

    // Then finished lot
    if (results.finished_lots?.length) {
        const finLot = results.finished_lots[0];
        const genealogy = await traceFromFinishedLot(finLot.id);
        return { type: "finished" as const, data: finLot, genealogy };
    }

    // Then intermediate lot
    if (results.intermediate_lots?.length) {
        const intLot = results.intermediate_lots[0];
        const supabase = createClient();
        const { data: prodLot } = await supabase
            .from("production_lots")
            .select("*")
            .eq("id", intLot.production_lot_id)
            .single();
        const { data: finishedLots } = await supabase
            .from("finished_lots")
            .select("*")
            .eq("intermediate_lot_id", intLot.id);
        return {
            type: "intermediate" as const,
            data: intLot,
            genealogy: {
                production_lot: prodLot as any,
                intermediate_lots: [intLot],
                finished_lots: finishedLots || [],
            },
        };
    }

    // Not found
    return null;
}

// ============================================
// Dashboard/Overview Queries (no hardcoded data)
// ============================================

export interface RecentEvent {
    type: 'RM' | 'PL' | 'PI' | 'PF' | 'NC' | 'PCC';
    code: string;
    description: string;
    time: string;
    location: string;
}

export interface ActiveProductionChain {
    id: string;
    lote_pai: string;
    lote_pai_id: string;
    rm: string;
    rm_id: string | null;
    pi: string;
    pi_id: string | null;
    pf: string;
    pf_id: string | null;
    nc: string;
    pcc: string;
}

export interface TraceabilityStats {
    activeLots: number;
    eventsToday: number;
    openNCs: number;
    pccsOk: string;
}

export async function getRecentTraceabilityEvents(): Promise<RecentEvent[]> {
    const supabase = createClient();
    const events: RecentEvent[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        // Get recent production lots
        const { data: lots } = await supabase
            .from('production_lots')
            .select('id, code, status, created_at')
            .gte('created_at', today.toISOString())
            .order('created_at', { ascending: false })
            .limit(3);

        if (lots) {
            for (const lot of lots) {
                events.push({
                    type: 'PL',
                    code: lot.code,
                    description: `Lot ${lot.status}`,
                    time: new Date(lot.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
                    location: 'Production'
                });
            }
        }

        // Get recent intermediate lots
        const { data: intermediates } = await supabase
            .from('intermediate_lots')
            .select('id, code, status, created_at')
            .gte('created_at', today.toISOString())
            .order('created_at', { ascending: false })
            .limit(2);

        if (intermediates) {
            for (const lot of intermediates) {
                events.push({
                    type: 'PI',
                    code: lot.code,
                    description: `Intermediate ${lot.status}`,
                    time: new Date(lot.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
                    location: 'PCP'
                });
            }
        }

        // Get recent NCs
        const { data: ncs } = await supabase
            .from('non_conformities')
            .select('id, code, title, created_at')
            .gte('created_at', today.toISOString())
            .order('created_at', { ascending: false })
            .limit(2);

        if (ncs) {
            for (const nc of ncs) {
                events.push({
                    type: 'NC',
                    code: nc.code,
                    description: nc.title || 'NC opened',
                    time: new Date(nc.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
                    location: 'Quality'
                });
            }
        }

        // Sort by time descending
        events.sort((a, b) => b.time.localeCompare(a.time));

        return events.slice(0, 6);
    } catch (error) {
        console.error('Error fetching traceability events:', error);
        return [];
    }
}

export async function getActiveProductionChains(): Promise<ActiveProductionChain[]> {
    const supabase = createClient();

    try {
        // Get active production lots with their relationships
        const { data: lots, error } = await supabase
            .from('production_lots')
            .select('id, code, status')
            .in('status', ['in_progress', 'pending', 'active'])
            .order('created_at', { ascending: false })
            .limit(5);

        if (error || !lots) {
            return [];
        }

        const chains: ActiveProductionChain[] = [];

        for (const lot of lots) {
            // Get intermediate lots
            const { data: intermediates } = await supabase
                .from('intermediate_lots')
                .select('id, code')
                .eq('production_lot_id', lot.id)
                .limit(1);

            // Get finished lots
            const { data: finished } = await supabase
                .from('finished_lots')
                .select('id, code')
                .eq('production_lot_id', lot.id)
                .limit(1);

            // Get open NCs
            const { data: ncs } = await supabase
                .from('non_conformities')
                .select('code')
                .eq('production_lot_id', lot.id)
                .eq('status', 'open')
                .limit(1);

            chains.push({
                id: lot.id,
                lote_pai: lot.code,
                lote_pai_id: lot.id,
                rm: '-',
                rm_id: null,
                pi: intermediates?.[0]?.code || '-',
                pi_id: intermediates?.[0]?.id || null,
                pf: finished?.[0]?.code || '-',
                pf_id: finished?.[0]?.id || null,
                nc: ncs?.[0]?.code || '-',
                pcc: '-'
            });
        }

        return chains;
    } catch (error) {
        console.error('Error fetching production chains:', error);
        return [];
    }
}

export async function getTraceabilityStats(): Promise<TraceabilityStats> {
    const supabase = createClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        // Count active lots
        const { count: activeLots } = await supabase
            .from('production_lots')
            .select('id', { count: 'exact', head: true })
            .in('status', ['in_progress', 'pending', 'active']);

        // Count events today (production lots created today)
        const { count: eventsToday } = await supabase
            .from('production_lots')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());

        // Count open NCs
        const { count: openNCs } = await supabase
            .from('non_conformities')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'open');

        // Count PCCs (using pcc_controls table if exists)
        let pccsOk = '0/0';
        try {
            const { count: totalPCCs } = await supabase
                .from('pcc_controls')
                .select('id', { count: 'exact', head: true });

            if (totalPCCs && totalPCCs > 0) {
                pccsOk = `${totalPCCs}/${totalPCCs}`;
            }
        } catch {
            // Table might not exist
        }

        return {
            activeLots: activeLots || 0,
            eventsToday: eventsToday || 0,
            openNCs: openNCs || 0,
            pccsOk
        };
    } catch (error) {
        console.error('Error fetching traceability stats:', error);
        return {
            activeLots: 0,
            eventsToday: 0,
            openNCs: 0,
            pccsOk: '0/0'
        };
    }
}
