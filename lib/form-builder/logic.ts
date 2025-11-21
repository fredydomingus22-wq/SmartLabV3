import type { ConditionalLogic } from "@/types/form-builder";

export function shouldShowField(
    logic: ConditionalLogic | undefined,
    formValues: Record<string, any>
): boolean {
    if (!logic || !logic.show_if || logic.show_if.length === 0) {
        return true;
    }

    // All conditions must be met (AND logic) - could be extended to support OR
    return logic.show_if.every((condition) => {
        const fieldValue = formValues[condition.field_key];

        switch (condition.operator) {
            case 'equals':
                return fieldValue == condition.value;
            case 'not_equals':
                return fieldValue != condition.value;
            case 'contains':
                return Array.isArray(fieldValue)
                    ? fieldValue.includes(condition.value)
                    : String(fieldValue).includes(String(condition.value));
            case 'greater_than':
                return Number(fieldValue) > Number(condition.value);
            case 'less_than':
                return Number(fieldValue) < Number(condition.value);
            default:
                return true;
        }
    });
}
