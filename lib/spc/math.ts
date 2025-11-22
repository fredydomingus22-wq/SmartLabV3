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

const subgroupConstants: Record<number, { A2: number; d2: number }> = {
    2: { A2: 1.880, d2: 1.128 },
    3: { A2: 1.023, d2: 1.693 },
    4: { A2: 0.729, d2: 2.059 },
    5: { A2: 0.577, d2: 2.326 },
    6: { A2: 0.483, d2: 2.534 },
    7: { A2: 0.419, d2: 2.704 },
    8: { A2: 0.373, d2: 2.847 },
    9: { A2: 0.337, d2: 2.970 },
    10: { A2: 0.308, d2: 3.078 }
};

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

// Calculate Control Limits for Xbar-R (uses subgroup size)
export function calculateXbarRLimits(data: SPCDataPoint[], subgroupSize: number = 4, usl?: number, lsl?: number): ControlLimits {
    const constants = subgroupConstants[subgroupSize] ?? subgroupConstants[4];
    const values = data.map((d) => d.value);

    const subgroups: number[][] = [];
    for (let i = 0; i < values.length; i += subgroupSize) {
        subgroups.push(values.slice(i, i + subgroupSize));
    }

    const subgroupMeans = subgroups
        .filter((sg) => sg.length > 0)
        .map((sg) => calculateMean(sg));
    const ranges = subgroups
        .filter((sg) => sg.length > 0)
        .map((sg) => Math.max(...sg) - Math.min(...sg));

    const xbarBar = calculateMean(subgroupMeans);
    const rBar = calculateMean(ranges);

    const ucl = xbarBar + constants.A2 * rBar;
    const lcl = xbarBar - constants.A2 * rBar;
    const sigma = rBar / constants.d2;

    return {
        ucl,
        lcl,
        cl: xbarBar,
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

    if (sigmaLong === 0 || sigmaShort === 0) {
        return null;
    }

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
