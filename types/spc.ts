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
    severity?: 'warning' | 'critical';
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

export type SpcMeasurement = {
    id: string;
    parameter_id: string;
    value: number;
    unit?: string;
    measured_at: string;
    production_lot_id?: string;
    intermediate_lot_id?: string;
    finished_lot_id?: string;
    product_id?: string;
    line?: string;
};

export type SpcChartConfig = {
    id: string;
    name: string;
    chart_type: ChartType;
    parameter_id?: string;
    product_id?: string;
    line?: string;
    target?: number;
    lsl?: number;
    usl?: number;
    lcl?: number;
    ucl?: number;
    baseline_window?: number;
    recalculation_strategy?: string;
    ruleset?: string;
};

export type SpcAlert = {
    id: string;
    chart_id?: string;
    parameter_id?: string;
    production_lot_id?: string;
    severity: 'info' | 'warning' | 'critical';
    type: 'rule_violation' | 'out_of_control' | 'prediction_risk' | 'capability';
    message: string;
    status: 'open' | 'acknowledged' | 'closed';
    triggered_at: string;
};

export type SpcPrediction = {
    id?: string;
    chart_id?: string;
    parameter_id?: string;
    production_lot_id?: string;
    horizon_minutes: number;
    risk_score: number;
    trend: 'improving' | 'stable' | 'degrading';
    model_version?: string;
    generated_at: string;
};

export type SpcRuleBreak = {
    rule_name: string;
    description: string;
    point: SPCDataPoint;
    severity: 'info' | 'warning' | 'critical';
};

export type SpcWarRoomState = {
    analysis: SPCAnalysisResult | null;
    alerts: SpcAlert[];
    predictions: SpcPrediction[];
    chartConfig?: SpcChartConfig;
};

export type SpcFilters = {
    parameterId?: string;
    line?: string;
    productId?: string;
    window?: "1h" | "8h" | "24h" | "7d";
};
