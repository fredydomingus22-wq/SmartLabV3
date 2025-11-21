export type SPCDataPoint = {
    id: string;
    value: number;
    timestamp: string;
    label?: string; // e.g., Lot ID, Sample ID
    metadata?: Record<string, any>;
};

export type ControlLimits = {
    ucl: number; // Upper Control Limit
    lcl: number; // Lower Control Limit
    cl: number;  // Center Line (Mean)
    usl?: number; // Upper Specification Limit
    lsl?: number; // Lower Specification Limit
    sigma: number; // Standard Deviation
};

export type NelsonRuleViolation = {
    ruleId: string;
    ruleName: string;
    description: string;
    index: number; // Index of the data point triggering the rule
    point: SPCDataPoint;
};

export type CapabilityIndices = {
    cp: number;
    cpk: number;
    pp: number;
    ppk: number;
    sigmaShort: number; // Within-subgroup standard deviation
    sigmaLong: number;  // Overall standard deviation
};

export type SPCAnalysisResult = {
    limits: ControlLimits;
    violations: NelsonRuleViolation[];
    capability: CapabilityIndices | null; // Null if specs not provided
    data: SPCDataPoint[];
};

export type ChartType = 'I-MR' | 'Xbar-R' | 'Xbar-S' | 'P' | 'NP' | 'C' | 'U';
