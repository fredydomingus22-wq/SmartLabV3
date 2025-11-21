import { SPCDataPoint, ControlLimits, CapabilityIndices } from "@/types/spc";

// Helper: Calculate Mean
export function calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
}

// Helper: Calculate Standard Deviation (Sample)
export function calculateStdDev(values: number[], isSample: boolean = true): number {
    if (values.length < 2) return 0;
    const mean = calculateMean(values);
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (values.length - (isSample ? 1 : 0));
    return Math.sqrt(variance);
}

// Helper: Calculate Moving Range (for I-MR charts)
export function calculateMovingRanges(values: number[]): number[] {
    const ranges: number[] = [];
    for (let i = 1; i < values.length; i++) {
        ranges.push(Math.abs(values[i] - values[i - 1]));
    }
    return ranges;
}

// Calculate Control Limits for I-MR Chart
export function calculateIMRLimits(data: SPCDataPoint[], usl?: number, lsl?: number): ControlLimits {
    const values = data.map(d => d.value);
    const mean = calculateMean(values);

    const movingRanges = calculateMovingRanges(values);
    const mrBar = calculateMean(movingRanges);

    // Constants for I-MR (n=2)
    // E2 = 2.660, d2 = 1.128
    const sigma = mrBar / 1.128;

    const ucl = mean + 3 * sigma;
    const lcl = mean - 3 * sigma;

    return {
        ucl,
        lcl,
        cl: mean,
        usl,
        lsl,
        sigma
    };
}

// Calculate Capability Indices (Cp, Cpk, Pp, Ppk)
export function calculateCapability(
    data: SPCDataPoint[],
    limits: ControlLimits
): CapabilityIndices | null {
    if (limits.usl === undefined || limits.lsl === undefined) return null;

    const values = data.map(d => d.value);
    const mean = calculateMean(values);

    // Sigma Long (Overall standard deviation) -> for Pp, Ppk
    const sigmaLong = calculateStdDev(values, true);

    // Sigma Short (Within-subgroup) -> for Cp, Cpk
    // For I-MR, sigma short is estimated from MRbar / d2
    const sigmaShort = limits.sigma;

    const pp = (limits.usl - limits.lsl) / (6 * sigmaLong);
    const ppu = (limits.usl - mean) / (3 * sigmaLong);
    const ppl = (mean - limits.lsl) / (3 * sigmaLong);
    const ppk = Math.min(ppu, ppl);

    const cp = (limits.usl - limits.lsl) / (6 * sigmaShort);
    const cpu = (limits.usl - mean) / (3 * sigmaShort);
    const cpl = (mean - limits.lsl) / (3 * sigmaShort);
    const cpk = Math.min(cpu, cpl);

    return {
        cp,
        cpk,
        pp,
        ppk,
        sigmaShort,
        sigmaLong
    };
}
