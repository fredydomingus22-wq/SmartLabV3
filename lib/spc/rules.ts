import { SPCDataPoint, ControlLimits, NelsonRuleViolation } from "@/types/spc";

export function checkNelsonRules(data: SPCDataPoint[], limits: ControlLimits): NelsonRuleViolation[] {
    const violations: NelsonRuleViolation[] = [];
    const values = data.map(d => d.value);
    const { cl, sigma } = limits;

    // Zone definitions
    const zoneA_Upper = cl + 3 * sigma;
    const zoneA_Lower = cl - 3 * sigma;
    const zoneB_Upper = cl + 2 * sigma;
    const zoneB_Lower = cl - 2 * sigma;
    const zoneC_Upper = cl + 1 * sigma;
    const zoneC_Lower = cl - 1 * sigma;

    for (let i = 0; i < values.length; i++) {
        const val = values[i];

        // Rule 1: One point beyond Zone A (3 sigma)
        if (val > zoneA_Upper || val < zoneA_Lower) {
            violations.push({
                ruleId: "Rule 1",
                ruleName: "Beyond 3σ",
                description: "One point beyond Zone A (3 standard deviations from mean).",
                index: i,
                point: data[i]
            });
        }

        // Rule 2: Nine points in a row on same side of center line
        if (i >= 8) {
            const subset = values.slice(i - 8, i + 1);
            const allAbove = subset.every(v => v > cl);
            const allBelow = subset.every(v => v < cl);
            if (allAbove || allBelow) {
                violations.push({
                    ruleId: "Rule 2",
                    ruleName: "Bias (9 points)",
                    description: "Nine points in a row on the same side of the center line.",
                    index: i,
                    point: data[i]
                });
            }
        }

        // Rule 3: Six points in a row, all increasing or all decreasing
        if (i >= 5) {
            const subset = values.slice(i - 5, i + 1);
            let increasing = true;
            let decreasing = true;
            for (let j = 1; j < subset.length; j++) {
                if (subset[j] <= subset[j - 1]) increasing = false;
                if (subset[j] >= subset[j - 1]) decreasing = false;
            }
            if (increasing || decreasing) {
                violations.push({
                    ruleId: "Rule 3",
                    ruleName: "Trend (6 points)",
                    description: "Six points in a row, all increasing or all decreasing.",
                    index: i,
                    point: data[i]
                });
            }
        }

        // Rule 4: Fourteen points in a row, alternating up and down
        if (i >= 13) {
            const subset = values.slice(i - 13, i + 1);
            let alternating = true;
            for (let j = 1; j < subset.length; j++) {
                if (j % 2 === 1) { // Odd index in subset
                    // Check if direction flips from previous
                    // Actually simpler: check if (current - prev) * (prev - prevprev) < 0
                    // But for 14 points, just checking pattern: U D U D or D U D U
                    // Let's use a simpler check: sign of difference must flip
                    if (j > 1) {
                        const diffCurrent = subset[j] - subset[j - 1];
                        const diffPrev = subset[j - 1] - subset[j - 2];
                        if (Math.sign(diffCurrent) === Math.sign(diffPrev)) {
                            alternating = false;
                            break;
                        }
                    }
                }
            }
            // Note: The loop above is a bit weak for the first pair.
            // Proper check:
            let isAlternating = true;
            for (let j = 1; j < subset.length - 1; j++) {
                const d1 = subset[j] - subset[j - 1];
                const d2 = subset[j + 1] - subset[j];
                if (Math.sign(d1) === Math.sign(d2)) {
                    isAlternating = false;
                    break;
                }
            }

            if (isAlternating && subset.length > 2) { // Need at least 3 points to check alternation logic properly, but here we have 14
                violations.push({
                    ruleId: "Rule 4",
                    ruleName: "Oscillation (14 points)",
                    description: "Fourteen points in a row, alternating up and down.",
                    index: i,
                    point: data[i]
                });
            }
        }

        // Rule 5: Two out of three points in a row in Zone A or beyond (same side)
        if (i >= 2) {
            const subset = values.slice(i - 2, i + 1);
            // Check upper side
            const countUpper = subset.filter(v => v > zoneB_Upper).length;
            if (countUpper >= 2) {
                violations.push({
                    ruleId: "Rule 5",
                    ruleName: "Zone A Warning (2/3)",
                    description: "Two out of three points > 2σ from mean.",
                    index: i,
                    point: data[i]
                });
            }
            // Check lower side
            const countLower = subset.filter(v => v < zoneB_Lower).length;
            if (countLower >= 2) {
                violations.push({
                    ruleId: "Rule 5",
                    ruleName: "Zone A Warning (2/3)",
                    description: "Two out of three points < -2σ from mean.",
                    index: i,
                    point: data[i]
                });
            }
        }
    }

    return violations;
}
