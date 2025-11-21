// Form Builder Types
export type FieldType =
    | 'text'
    | 'number'
    | 'select'
    | 'checkbox'
    | 'date'
    | 'time'
    | 'datetime'
    | 'file'
    | 'textarea'
    | 'parameter_link'
    | 'signature';

export type FormCategory = 'analysis' | 'inspection' | 'checklist' | 'monitoring';

export type SubmissionStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface ValidationRule {
    type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
    value?: any;
    message?: string;
}

export interface ConditionalLogic {
    show_if?: {
        field_key: string;
        operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
        value: any;
    }[];
    required_if?: {
        field_key: string;
        operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
        value: any;
    }[];
}

export interface SelectOption {
    label: string;
    value: string;
}

export type FormModule =
    | 'general'
    | 'production-lots'
    | 'intermediate-lots'
    | 'finished-lots'
    | 'raw-materials'
    | 'raw-material-lots'
    | 'lab-tests'
    | 'audits'
    | 'food-safety'
    | 'traceability'
    | 'suppliers'
    | 'trainings'
    | 'documents'
    | 'nc'
    | 'spc';

export interface FormTemplate {
    id: string;
    name: string;
    description?: string;
    category: FormCategory;
    target_module?: FormModule;
    active: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface FormFieldGroup {
    id: string;
    template_id: string;
    name: string;
    description?: string;
    is_repeatable: boolean;
    min_rows: number;
    max_rows?: number;
    order_index: number;
    created_at: string;
}

export interface FormField {
    id: string;
    template_id: string;
    group_id?: string;
    field_key: string;
    label: string;
    field_type: FieldType;
    parameter_id?: string;
    placeholder?: string;
    help_text?: string;
    is_required: boolean;
    validation_rules: ValidationRule[];
    conditional_logic: ConditionalLogic;
    options: SelectOption[];
    default_value?: string;
    order_index: number;
    created_at: string;
}

export interface FormSubmission {
    id: string;
    template_id: string;
    entity_type?: string;
    entity_id?: string;
    submitted_by: string;
    submitted_at: string;
    data: Record<string, any>;
    status: SubmissionStatus;
    approved_by?: string;
    approved_at?: string;
    created_at: string;
    updated_at: string;
}

// Extended types with relations
export interface FormTemplateWithFields extends FormTemplate {
    fields: FormField[];
    groups: FormFieldGroup[];
}

export interface FormFieldWithParameter extends FormField {
    parameter?: {
        id: string;
        name: string;
        unit?: string;
        type: string;
        spec_min?: number;
        spec_target?: number;
        spec_max?: number;
    };
}
