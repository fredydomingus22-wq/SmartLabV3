/**
 * Advanced SPC Calculations for Cpk, Ppk, and Process Capability
 */

export interface ProcessCapabilityResult {
    cp: number;
    cpk: number;
    pp: number;
    ppk: number;
    sigma: number;
    mean: number;
    stdDev: number;
    lsl: number;
    usl: number;
}

/**
 * Calculate process capability indices
 * @param values - Array of measurement values
 * @param lsl - Lower Specification Limit
 * @param usl - Upper Specification Limit
 * @returns ProcessCapabilityResult
 */
export function calculateProcessCapability(
    values: number[],
    lsl: number,
    usl: number
): ProcessCapabilityResult {
    if (values.length < 2) {
        throw new Error("Need at least 2 values for calculation");
    }

    // Calculate mean
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

    // Calculate standard deviation
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
    const stdDev = Math.sqrt(variance);

    // Calculate process sigma (6 sigma = USL - LSL for a centered process)
    const sigma = stdDev;

    // Calculate Cp (Process Potential)
    const cp = (usl - lsl) / (6 * sigma);

    // Calculate Cpk (Process Capability)
    const cpupper = (usl - mean) / (3 * sigma);
    const cplower = (mean - lsl) / (3 * sigma);
    const cpk = Math.min(cpupper, cplower);

    // Pp and Ppk use overall standard deviation
    const pp = (usl - lsl) / (6 * sigma);
    const ppk = cpk; // Simplified - in practice, Ppk uses long-term sigma

    return {
        cp,
        cpk,
        pp,
        ppk,
        sigma,
        mean,
        stdDev,
        lsl,
        usl,
    };
}

/**
 * Calculate control limits for X-bar chart
 */
export function calculateXbarLimits(subgroupMeans: number[], subgroupRanges: number[]) {
    const grandMean = subgroupMeans.reduce((sum, val) => sum + val, 0) / subgroupMeans.length;
    const avgRange = subgroupRanges.reduce((sum, val) => sum + val, 0) / subgroupRanges.length;

    // A2 factor for subgroup size (assuming n=5, A2=0.577)
    const A2 = 0.577;

    const ucl = grandMean + A2 * avgRange;
    const lcl = grandMean - A2 * avgRange;

    return { grandMean, ucl, lcl };
}

/**
 * Calculate control limits for R chart
 */
export function calculateRLimits(subgroupRanges: number[]) {
    const avgRange = subgroupRanges.reduce((sum, val) => sum + val, 0) / subgroupRanges.length;

    // D3 and D4 factors for subgroup size (assuming n=5)
    const D3 = 0;
    const D4 = 2.114;

    const ucl = D4 * avgRange;
    const lcl = D3 * avgRange;

    return { avgRange, ucl, lcl };
}

/**
 * Determine process capability interpretation
 */
export function interpretCpk(cpk: number): string {
    if (cpk >= 2.0) return "Excellent";
    if (cpk >= 1.33) return "Adequate";
    if (cpk >= 1.0) return "Marginal";
    return "Inadequate";
}
