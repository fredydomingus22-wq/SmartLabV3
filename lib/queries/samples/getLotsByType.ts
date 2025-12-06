import { createClient } from "@/lib/supabase/client";

export type LotType = 'production' | 'intermediate' | 'finished_product' | 'raw_material';

export interface Lot {
    id: string;
    code: string;
    type: LotType;
}

export async function getLotsByType(lotType: LotType): Promise<Lot[]> {
    const supabase = createClient();

    let tableName: string;

    switch (lotType) {
        case 'production':
            tableName = 'production_lots';
            break;
        case 'intermediate':
            tableName = 'intermediate_lots';
            break;
        case 'finished_product':
            tableName = 'finished_product_lots';
            break;
        case 'raw_material':
            // raw_material_lots table doesn't exist yet - return empty array
            console.warn('raw_material_lots table not implemented yet');
            return [];
        default:
            throw new Error(`Invalid lot type: ${lotType}`);
    }

    const { data, error } = await supabase
        .from(tableName)
        .select("id, code")
        .order("code", { ascending: false })
        .limit(100);

    if (error) {
        console.error(`Error fetching ${lotType} lots:`, error);
        throw new Error(`Failed to fetch ${lotType} lots`);
    }

    return (data || []).map(lot => ({
        ...lot,
        type: lotType
    }));
}

// Map sample type codes to lot types
export function getSampleTypeLotMapping(sampleTypeCode: string): LotType | null {
    // Códigos reais da tabela sample_types (ver migration 20251126_refactor_samples_schema.sql)
    const mapping: Record<string, LotType> = {
        'finished_product': 'finished_product',
        'intermediate_product': 'intermediate',
        'raw_material': 'raw_material'
        // environmental_swab, equipment_swab, personnel_swab, water_sample, air_sample → null (sem lote)
    };

    return mapping[sampleTypeCode] || null;
}
