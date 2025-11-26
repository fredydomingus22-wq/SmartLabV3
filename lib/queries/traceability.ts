import { createClient } from "@/lib/supabase/client";
import { ProductionLot, IntermediateLot, FinishedLot, Product } from "@/types/production";
import { RawMaterialLot } from "@/types/inventory";
import { SampleStatus } from "@/lib/constants/status";
import { NonConformity } from "@/types/qms";

export interface GenealogyChain {
    production_lot?: ProductionLot;
    intermediate_lots: IntermediateLot[];
    finished_lots: FinishedLot[];
}

export interface TraceabilitySample {
    id: string;
    code: string;
    status: SampleStatus;
    production_lot_id?: string | null;
    intermediate_lot_id?: string | null;
}

export interface TraceabilityNC extends Pick<NonConformity, "id" | "code" | "status" | "sample_id"> {}

export interface TraceabilityGraph {
    raw_material_lots: (RawMaterialLot & { raw_material?: { id: string; name: string; code?: string | null } })[];
    production_lots: (ProductionLot & { product?: Product })[];
    intermediate_lots: IntermediateLot[];
    finished_lots: FinishedLot[];
    samples: TraceabilitySample[];
    non_conformities: TraceabilityNC[];
}

export interface TraceabilityChain {
    productionLot: ProductionLot & { product?: Product };
    rawMaterials: RawMaterialLot[];
    intermediateLots: IntermediateLot[];
    finishedLots: FinishedLot[];
    samples: TraceabilitySample[];
    nonConformities: TraceabilityNC[];
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
 * Loads an aggregated graph of all lot relations using the Supabase foreign keys
 * so UI components can traverse the RM → PL → PI → PF chain and quality events.
 */
export async function getTraceabilityGraph(): Promise<TraceabilityGraph> {
    const supabase = createClient();

    const [rawLots, productionLots, intermediateLots, finishedLots, samples, nonConformities] = await Promise.all([
        supabase
            .from("raw_material_lots")
            .select(`*, raw_material:raw_materials(id, name, code)`) // Architecture arrow: RM → PL inputs
            .order("created_at", { ascending: false }),
        supabase
            .from("production_lots")
            .select(`*, product:products(*)`)
            .order("created_at", { ascending: false }),
        supabase
            .from("intermediate_lots")
            .select(`
                *,
                production_lot:production_lots(id, code, status, product:products(*)),
                ingredients:intermediate_lot_ingredients(raw_material_id, raw_material_name, lot_number)
            `)
            .order("created_at", { ascending: false }),
        supabase
            .from("finished_lots")
            .select(`
                *,
                intermediate_lot:intermediate_lots(
                    id,
                    code,
                    production_lot_id,
                    production_lot:production_lots(id, code, status, product:products(*))
                )
            `)
            .order("created_at", { ascending: false }),
        supabase
            .from("samples")
            .select("id, code, status, production_lot_id, intermediate_lot_id")
            .order("collected_at", { ascending: false }),
        supabase
            .from("nc")
            .select("id, code, status, sample_id")
            .order("created_at", { ascending: false }),
    ]);

    if (rawLots.error) throw rawLots.error;
    if (productionLots.error) throw productionLots.error;
    if (intermediateLots.error) throw intermediateLots.error;
    if (finishedLots.error) throw finishedLots.error;
    if (samples.error) throw samples.error;
    if (nonConformities.error) throw nonConformities.error;

    return {
        raw_material_lots: rawLots.data as TraceabilityGraph["raw_material_lots"],
        production_lots: productionLots.data as TraceabilityGraph["production_lots"],
        intermediate_lots: intermediateLots.data as IntermediateLot[],
        finished_lots: finishedLots.data as FinishedLot[],
        samples: (samples.data || []) as TraceabilitySample[],
        non_conformities: (nonConformities.data || []) as TraceabilityNC[],
    };
}

/**
 * Builds production-centric chains that include upstream RM and downstream QC events.
 */
export function buildProductionChains(graph: TraceabilityGraph): TraceabilityChain[] {
    const rawById = new Map(graph.raw_material_lots.map(raw => [raw.id, raw]));

    const productionChains = graph.production_lots.map((prodLot) => {
        const relatedIntermediates = graph.intermediate_lots.filter(
            (lot) => lot.production_lot_id === prodLot.id
        );
        const relatedIntermediateIds = relatedIntermediates.map((lot) => lot.id);

        const relatedFinished = graph.finished_lots.filter((lot) => {
            if (lot.intermediate_lot_id && relatedIntermediateIds.includes(lot.intermediate_lot_id)) return true;
            const relatedProd = (lot as any).intermediate_lot?.production_lot_id;
            return relatedProd ? relatedProd === prodLot.id : false;
        });

        const relatedSamples = graph.samples.filter(
            (sample) =>
                sample.production_lot_id === prodLot.id ||
                (sample.intermediate_lot_id ? relatedIntermediateIds.includes(sample.intermediate_lot_id) : false)
        );

        const relatedNCs = graph.non_conformities.filter((nc) =>
            nc.sample_id ? relatedSamples.some((sample) => sample.id === nc.sample_id) : false
        );

        const rawMaterials = relatedIntermediates
            .flatMap((lot: any) => lot.ingredients || [])
            .map((ingredient: any) => rawById.get(ingredient.raw_material_id))
            .filter(Boolean) as RawMaterialLot[];

        return {
            productionLot: prodLot,
            rawMaterials,
            intermediateLots: relatedIntermediates,
            finishedLots: relatedFinished,
            samples: relatedSamples,
            nonConformities: relatedNCs,
        };
    });

    return productionChains;
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
