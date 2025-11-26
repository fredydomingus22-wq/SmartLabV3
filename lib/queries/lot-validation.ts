/**
 * Lot Validation Functions - Epic 1.3
 * Validation logic for lot closure
 */

import { createClient } from '@/lib/supabase/client';

export interface LotClosureValidation {
    canClose: boolean;
    pendingSamples: number;
    unvalidatedAnalyses: number;
    unresolvedFailures: number;
    issues: string[];
}

/**
 * Validate if a lot can be closed
 * Checks:
 * 1. All finished product samples are analyzed
 * 2. All analyses are validated (locked)
 * 3. All failed analyses have approved repeats
 */
export async function validateLotClosure(lotId: string): Promise<LotClosureValidation> {
    const supabase = createClient();
    const issues: string[] = [];

    try {
        // 1. Check for pending samples (not analyzed)
        const { count: pendingSamples } = await supabase
            .from('samples')
            .select('*', { count: 'exact', head: true })
            .eq('finished_lot_id', lotId)
            .neq('status', 'analyzed');

        if (pendingSamples && pendingSamples > 0) {
            issues.push(`${pendingSamples} amostra(s) pendente(s) de análise`);
        }

        // 2. Check for unvalidated analyses (not locked)
        const { data: samplesData } = await supabase
            .from('samples')
            .select('id')
            .eq('finished_lot_id', lotId);

        const sampleIds = samplesData?.map(s => s.id) || [];

        let unvalidatedAnalyses = 0;
        if (sampleIds.length > 0) {
            const { count } = await supabase
                .from('lab_analysis')
                .select('*', { count: 'exact', head: true })
                .in('sample_id', sampleIds)
                .eq('is_locked', false);

            unvalidatedAnalyses = count || 0;
            if (unvalidatedAnalyses > 0) {
                issues.push(`${unvalidatedAnalyses} análise(s) não validada(s)`);
            }
        }

        // 3. Check for unresolved failures (failed without approved repeat)
        const { data: failedAnalyses } = await supabase
            .from('lab_analysis')
            .select('id, sample_id')
            .in('sample_id', sampleIds)
            .eq('validation_status', 'failed')
            .is('parent_analysis_id', null);

        let unresolvedFailures = 0;
        if (failedAnalyses && failedAnalyses.length > 0) {
            for (const failed of failedAnalyses) {
                // Check if there's an approved repeat
                const { data: repeats } = await supabase
                    .from('lab_analysis')
                    .select('id')
                    .eq('parent_analysis_id', failed.id)
                    .eq('validation_status', 'approved')
                    .limit(1);

                if (!repeats || repeats.length === 0) {
                    unresolvedFailures++;
                }
            }

            if (unresolvedFailures > 0) {
                issues.push(`${unresolvedFailures} análise(s) reprovada(s) sem repeat aprovado`);
            }
        }

        return {
            canClose: issues.length === 0,
            pendingSamples: pendingSamples || 0,
            unvalidatedAnalyses,
            unresolvedFailures,
            issues,
        };
    } catch (error) {
        console.error('Error validating lot closure:', error);
        return {
            canClose: false,
            pendingSamples: 0,
            unvalidatedAnalyses: 0,
            unresolvedFailures: 0,
            issues: ['Erro ao validar encerramento do lote'],
        };
    }
}

/**
 * Close a production lot
 */
export async function closeLot(lotId: string, notes?: string): Promise<void> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('production_lots')
        .update({
            status: 'encerrado',
            closed_by: user.id,
            closed_at: new Date().toISOString(),
            closure_notes: notes || null,
        })
        .eq('id', lotId);

    if (error) throw error;
}
