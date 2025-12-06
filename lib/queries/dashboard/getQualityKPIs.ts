'use server';

import { createTenantSafeClient } from '@/lib/tenant-context';

export interface QualityKPIs {
    activeLotsCount: number;
    criticalAlertsCount: number;
    pendingApprovalsCount: number;
    oosTestsToday: number;
    ncOpenCount: number;
    complianceScore: number;
}

export async function getQualityKPIs(): Promise<QualityKPIs> {
    const { supabase, tenantId } = await createTenantSafeClient();

    // Active lots (status = active)
    const { count: activeLotsCount } = await supabase
        .from('production_lots')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'active');

    // Critical alerts (from non_conformities with severity critical)
    const { count: criticalAlertsCount } = await supabase
        .from('non_conformities')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('severity', 'critical')
        .in('status', ['open', 'investigating']);

    // Pending approvals
    const { count: pendingApprovalsCount } = await supabase
        .from('approval_requests')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('status', 'pending');

    // Out-of-spec tests today
    const today = new Date().toISOString().split('T')[0];
    const { count: oosTestsToday } = await supabase
        .from('lab_analysis')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('validation_status', 'failed')
        .gte('created_at', today);

    // Open NCs
    const { count: ncOpenCount } = await supabase
        .from('non_conformities')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .in('status', ['open', 'investigating']);

    // Compliance score (calculated based on various metrics)
    const complianceScore = calculateComplianceScore({
        activeLotsCount: activeLotsCount || 0,
        criticalAlertsCount: criticalAlertsCount || 0,
        oosTestsToday: oosTestsToday || 0,
        ncOpenCount: ncOpenCount || 0
    });

    return {
        activeLotsCount: activeLotsCount || 0,
        criticalAlertsCount: criticalAlertsCount || 0,
        pendingApprovalsCount: pendingApprovalsCount || 0,
        oosTestsToday: oosTestsToday || 0,
        ncOpenCount: ncOpenCount || 0,
        complianceScore
    };
}

function calculateComplianceScore(metrics: {
    activeLotsCount: number;
    criticalAlertsCount: number;
    oosTestsToday: number;
    ncOpenCount: number;
}): number {
    // Base score
    let score = 100;

    // Deduct for critical alerts
    score -= metrics.criticalAlertsCount * 5;

    // Deduct for OOS tests
    score -= metrics.oosTestsToday * 3;

    // Deduct for open NCs
    score -= metrics.ncOpenCount * 2;

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
}
