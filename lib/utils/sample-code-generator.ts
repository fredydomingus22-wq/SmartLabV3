/**
 * Sample Code Generator Utility
 * 
 * Generates unique sample codes following the format:
 * [ProductCode][4digitsLot]-[Tank]-[Seq]
 * 
 * Example: COK1234-TK01-001
 * 
 * Sequence is per tank per day as per User Story 2.1
 */

import { createClient } from '@/lib/supabase/client';

export interface SampleCodeParams {
    productId: string;
    lotCode: string;
    tankId?: string;
    tankCode?: string; // Manual tank code like 'TK01'
}

export interface GeneratedSampleCode {
    code: string;
    sequence: number;
    date: string;
}

/**
 * Generates a unique sample code using database function
 * This ensures atomicity and prevents duplicate sequences
 */
export async function generateSampleCode(
    params: SampleCodeParams
): Promise<GeneratedSampleCode> {
    const supabase = createClient();

    try {
        // Call database function for atomic sequence generation
        const { data, error } = await supabase.rpc('generate_sample_code', {
            p_product_id: params.productId,
            p_tank_id: params.tankId || params.tankCode,
            p_lot_code: params.lotCode,
        });

        if (error) {
            console.error('Error generating sample code:', error);
            throw new Error(`Failed to generate sample code: ${error.message}`);
        }

        // Get the sequence number from sample_sequences table
        const today = new Date().toISOString().split('T')[0];
        const { data: seqData } = await supabase
            .from('sample_sequences')
            .select('last_sequence')
            .eq('tank_id', params.tankId || params.tankCode)
            .eq('date', today)
            .single();

        return {
            code: data as string,
            sequence: seqData?.last_sequence || 1,
            date: today,
        };
    } catch (err) {
        console.error('Sample code generation error:', err);
        throw err;
    }
}

/**
 * Generates sample code format preview without saving to database
 * Useful for UI previews and validation
 */
export function previewSampleCode(
    productSKU: string,
    lotCode: string,
    tankCode: string,
    sequence: number = 1
): string {
    const productCode = productSKU.substring(0, 3).toUpperCase();
    const lotDigits = lotCode.slice(-4);
    const seqFormatted = sequence.toString().padStart(3, '0');

    return `${productCode}${lotDigits}-${tankCode}-${seqFormatted}`;
}

/**
 * Validates sample code format
 */
export function validateSampleCodeFormat(code: string): boolean {
    // Format: XXX1234-XXXX-001
    const pattern = /^[A-Z]{3}\d{4}-[A-Z0-9]+-\d{3}$/;
    return pattern.test(code);
}

/**
 * Parses a sample code into its components
 */
export function parseSampleCode(code: string): {
    productCode: string;
    lotDigits: string;
    tankCode: string;
    sequence: number;
} | null {
    if (!validateSampleCodeFormat(code)) {
        return null;
    }

    const [lotPart, tankCode, seqStr] = code.split('-');
    const productCode = lotPart.substring(0, 3);
    const lotDigits = lotPart.substring(3);
    const sequence = parseInt(seqStr, 10);

    return {
        productCode,
        lotDigits,
        tankCode,
        sequence,
    };
}

/**
 * Gets the next sequence number for a tank today
 * (Read-only, doesn't increment)
 */
export async function getNextSequencePreview(
    tankId: string
): Promise<number> {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('sample_sequences')
        .select('last_sequence')
        .eq('tank_id', tankId)
        .eq('date', today)
        .single();

    if (error || !data) {
        return 1; // First sample of the day
    }

    return (data.last_sequence || 0) + 1;
}
