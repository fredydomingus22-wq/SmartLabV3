import type { ValidationRule } from "@/types/form-builder";
import { RegisterOptions } from "react-hook-form";

export function getValidationRules(rules: ValidationRule[], isRequired: boolean): RegisterOptions {
    const registerOptions: RegisterOptions = {};

    if (isRequired) {
        registerOptions.required = "This field is required";
    }

    rules.forEach((rule) => {
        switch (rule.type) {
            case 'required':
                registerOptions.required = rule.message || "This field is required";
                break;
            case 'min':
                registerOptions.min = {
                    value: rule.value,
                    message: rule.message || `Minimum value is ${rule.value}`,
                };
                break;
            case 'max':
                registerOptions.max = {
                    value: rule.value,
                    message: rule.message || `Maximum value is ${rule.value}`,
                };
                break;
            case 'pattern':
                registerOptions.pattern = {
                    value: new RegExp(rule.value),
                    message: rule.message || "Invalid format",
                };
                break;
            // 'custom' validation would need a different approach, possibly passing a validation function
        }
    });

    return registerOptions;
}
