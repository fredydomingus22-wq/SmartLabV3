import { calculateMean, calculateStdDev } from "@/lib/spc/math";
import { ControlLimits, SPCDataPoint, SpcPrediction } from "@/types/spc";

function computeSlope(points: SPCDataPoint[]): number {
    if (points.length < 2) return 0;
    const xs = points.map((p, idx) => idx);
    const ys = points.map((p) => p.value);
    const xMean = calculateMean(xs);
    const yMean = calculateMean(ys);

    const numerator = xs.reduce((acc, x, idx) => acc + (x - xMean) * (ys[idx] - yMean), 0);
    const denominator = xs.reduce((acc, x) => acc + Math.pow(x - xMean, 2), 0);
    if (denominator === 0) return 0;
    return numerator / denominator;
}

function clampRisk(value: number) {
    return Math.max(0, Math.min(1, value));
}

export function predictRisks(
    points: SPCDataPoint[],
    limits: ControlLimits,
    horizons: number[] = [30, 60, 120]
): SpcPrediction[] {
    if (points.length === 0) return [];

    const tail = points.slice(-Math.min(points.length, 20));
    const slope = computeSlope(tail);
    const volatility = calculateStdDev(tail.map((p) => p.value)) || limits.sigma || 1;
    const last = tail[tail.length - 1].value;
    const distanceToLimit = Math.min(Math.abs((limits.ucl ?? last) - last), Math.abs(last - (limits.lcl ?? last)));

    return horizons.map((horizon) => {
        const horizonFactor = horizon / 120; // scale 0.25..1
        const driftRisk = clampRisk(Math.abs(slope) * horizonFactor);
        const stabilityPenalty = clampRisk(volatility / (limits.sigma ? limits.sigma * 2 : volatility || 1));
        const proximityRisk = clampRisk(distanceToLimit <= 0 ? 1 : 1 - Math.min(distanceToLimit / (3 * (limits.sigma || 1)), 1));

        const combined = clampRisk(0.15 + 0.5 * proximityRisk + 0.2 * stabilityPenalty + 0.15 * driftRisk);
        const trend: SpcPrediction["trend"] =
            slope > 0.01 ? "degrading" : slope < -0.01 ? "improving" : "stable";

        return {
            horizon_minutes: horizon,
            risk_score: Number(combined.toFixed(3)),
            trend,
            model_version: "heuristic-v1",
            generated_at: new Date().toISOString()
        };
    });
}
