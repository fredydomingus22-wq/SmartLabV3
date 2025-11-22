import { SPCDataPoint, ControlLimits, NelsonRuleViolation } from "@/types/spc";

export function checkNelsonRules(data: SPCDataPoint[], limits: ControlLimits): NelsonRuleViolation[] {
    const violations: NelsonRuleViolation[] = [];
    const values = data.map((d) => d.value);
    const { cl, sigma } = limits;

    const zoneAUpper = cl + 3 * sigma;
    const zoneALower = cl - 3 * sigma;
    const zoneBUpper = cl + 2 * sigma;
    const zoneBLower = cl - 2 * sigma;

    for (let i = 0; i < values.length; i++) {
        const val = values[i];

        // Rule 1: One point beyond 3 sigma
        if (val > zoneAUpper || val < zoneALower) {
            violations.push({
                ruleId: "Rule 1",
                ruleName: "Beyond 3 sigma",
                description: "One point beyond 3 standard deviations from the mean.",
                index: i,
                point: data[i],
                severity: "critical",
            });
        }

        // Rule 2: Nine points in a row on same side of center line
        if (i >= 8) {
            const subset = values.slice(i - 8, i + 1);
            const allAbove = subset.every((v) => v > cl);
            const allBelow = subset.every((v) => v < cl);
            if (allAbove || allBelow) {
                violations.push({
                    ruleId: "Rule 2",
                    ruleName: "Bias (9 points)",
                    description: "Nine points in a row on the same side of the center line.",
                    index: i,
                    point: data[i],
                    severity: "warning",
                });
            }
        }

        // Rule 3: Six points in a row increasing or decreasing
        if (i >= 5) {
            const subset = values.slice(i - 5, i + 1);
            const increasing = subset.every((v, idx) => idx === 0 || v > subset[idx - 1]);
            const decreasing = subset.every((v, idx) => idx === 0 || v < subset[idx - 1]);
            if (increasing || decreasing) {
                violations.push({
                    ruleId: "Rule 3",
                    ruleName: "Trend (6 points)",
                    description: "Six points in a row, all increasing or all decreasing.",
                    index: i,
                    point: data[i],
                    severity: "warning",
                });
            }
        }

        // Rule 4: Fourteen points alternating up/down
        if (i >= 13) {
            const subset = values.slice(i - 13, i + 1);
            const diffs = subset.slice(1).map((v, idx) => v - subset[idx]);
            const isAlternating = diffs.every((d, idx) => idx === 0 || Math.sign(d) !== Math.sign(diffs[idx - 1]));

            if (isAlternating) {
                violations.push({
                    ruleId: "Rule 4",
                    ruleName: "Oscillation (14 points)",
                    description: "Fourteen points alternating up and down.",
                    index: i,
                    point: data[i],
                    severity: "warning",
                });
            }
        }

        // Rule 5: Two of three points beyond 2 sigma on same side
        if (i >= 2) {
            const subset = values.slice(i - 2, i + 1);
            const countUpper = subset.filter((v) => v > zoneBUpper).length;
            if (countUpper >= 2) {
                violations.push({
                    ruleId: "Rule 5",
                    ruleName: "Zone A Warning (2/3)",
                    description: "Two out of three points above +2 sigma.",
                    index: i,
                    point: data[i],
                    severity: "warning",
                });
            }
            const countLower = subset.filter((v) => v < zoneBLower).length;
            if (countLower >= 2) {
                violations.push({
                    ruleId: "Rule 5",
                    ruleName: "Zone A Warning (2/3)",
                    description: "Two out of three points below -2 sigma.",
                    index: i,
                    point: data[i],
                    severity: "warning",
                });
            }
        }
    }

    return violations;
}
