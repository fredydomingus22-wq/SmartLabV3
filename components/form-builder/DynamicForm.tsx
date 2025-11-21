"use client"

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { FormTemplateWithFields, FormField } from "@/types/form-builder";
import {
    TextFieldRenderer,
    TextAreaRenderer,
    NumberFieldRenderer,
    SelectFieldRenderer,
    CheckboxFieldRenderer,
    DateFieldRenderer,
    TimeFieldRenderer
} from "./renderers/BasicRenderers";
import { Loader } from "@/components/ui/Loader";
import { shouldShowField } from "@/lib/form-builder/logic";

interface DynamicFormProps {
    template: FormTemplateWithFields;
    initialData?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => Promise<void>;
    isSubmitting?: boolean;
    readOnly?: boolean;
}

export function DynamicForm({
    template,
    initialData = {},
    onSubmit,
    isSubmitting = false,
    readOnly = false
}: DynamicFormProps) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: initialData
    });

    const formValues = watch();

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        }
    }, [initialData, reset]);

    // Sort fields by order_index
    const sortedFields = [...(template.fields || [])].sort((a, b) => a.order_index - b.order_index);

    const renderField = (field: FormField) => {
        // Check conditional logic
        if (!shouldShowField(field.conditional_logic, formValues)) {
            return null;
        }

        const commonProps = {
            field,
            register,
            control,
            errors,
            readOnly
        };

        switch (field.field_type) {
            case 'text':
                return <TextFieldRenderer key={field.id} {...commonProps} />;
            case 'textarea':
                return <TextAreaRenderer key={field.id} {...commonProps} />;
            case 'number':
                return <NumberFieldRenderer key={field.id} {...commonProps} />;
            case 'select':
                return <SelectFieldRenderer key={field.id} {...commonProps} />;
            case 'checkbox':
                return <CheckboxFieldRenderer key={field.id} {...commonProps} />;
            case 'date':
                return <DateFieldRenderer key={field.id} {...commonProps} />;
            case 'time':
                return <TimeFieldRenderer key={field.id} {...commonProps} />;
            // TODO: Implement other renderers
            default:
                return (
                    <div key={field.id} className="p-4 border border-dashed rounded text-muted-foreground text-sm">
                        Unsupported field type: {field.field_type}
                    </div>
                );
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                {sortedFields.map(field => renderField(field))}
            </div>

            {!readOnly && (
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader className="mr-2 h-4 w-4" />}
                        Submit Form
                    </Button>
                </div>
            )}
        </form>
    );
}
