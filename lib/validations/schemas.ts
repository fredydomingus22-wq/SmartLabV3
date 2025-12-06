/**
 * Centralized Zod validation schemas for SmartLab Enterprise
 * Eliminates duplicate validation logic across the application
 */

import { z } from 'zod';

// ============================================================================
// SAMPLE SCHEMAS
// ============================================================================

export const sampleSchema = z.object({
    sample_type_id: z.string().uuid('Invalid sample type ID'),
    product_id: z.string().uuid('Invalid product ID').optional(),
    production_lot_id: z.string().uuid('Invalid production lot ID').optional(),
    intermediate_lot_id: z.string().uuid('Invalid intermediate lot ID').optional(),
    raw_material_lot_id: z.string().uuid('Invalid raw material lot ID').optional(),
    finished_product_lot_id: z.string().uuid('Invalid finished product lot ID').optional(),
    collection_point: z.string().min(1, 'Collection point is required'),
    collected_by: z.string().min(1, 'Collector name is required'),
    collected_at: z.string().datetime('Invalid date format'),
    received_by: z.string().uuid('Invalid user ID').optional(),
    received_at: z.string().datetime('Invalid date format').optional(),
    notes: z.string().optional(),
    assigned_to: z.string().uuid('Invalid analyst ID').optional(),
    status: z.enum(['pending', 'in_analysis', 'approved', 'rejected']).optional(),
});

export type SampleInput = z.infer<typeof sampleSchema>;

// ============================================================================
// REAGENT SCHEMAS
// ============================================================================

export const reagentEntrySchema = z.object({
    reagent_id: z.string().uuid('Invalid reagent ID'),
    quantity: z.number().positive('Quantity must be positive'),
    batch_number: z.string().min(1, 'Batch number is required'),
    supplier: z.string().optional(),
    expiry_date: z.string().datetime('Invalid expiry date').optional(),
    cost_per_unit: z.number().positive('Cost must be positive').optional(),
    notes: z.string().optional(),
});

export type ReagentEntryInput = z.infer<typeof reagentEntrySchema>;

export const reagentWithdrawalSchema = z.object({
    reagent_id: z.string().uuid('Invalid reagent ID'),
    quantity: z.number().positive('Quantity must be positive'),
    used_for: z.string().min(1, 'Usage description is required'),
    notes: z.string().optional(),
});

export type ReagentWithdrawalInput = z.infer<typeof reagentWithdrawalSchema>;

// ============================================================================
// PARAMETER & ANALYSIS SCHEMAS
// ============================================================================

export const parameterSchema = z.object({
    name: z.string().min(1, 'Parameter name is required'),
    code: z.string().min(1, 'Parameter code is required'),
    unit: z.string().min(1, 'Unit is required'),
    category: z.string().optional(),
    method: z.string().optional(),
    description: z.string().optional(),
});

export type ParameterInput = z.infer<typeof parameterSchema>;

export const labAnalysisSchema = z.object({
    sample_id: z.string().uuid('Invalid sample ID'),
    parameter_id: z.string().uuid('Invalid parameter ID'),
    result_value: z.number({ invalid_type_error: 'Result must be a number' }),
    spec_min: z.number({ invalid_type_error: 'Spec min must be a number' }).optional(),
    spec_max: z.number({ invalid_type_error: 'Spec max must be a number' }).optional(),
    spec_target: z.number({ invalid_type_error: 'Spec target must be a number' }).optional(),
    validation_status: z.enum(['pending', 'passed', 'failed']).optional(),
    performed_by: z.string().uuid('Invalid analyst ID'),
    performed_at: z.string().datetime('Invalid date format').optional(),
    notes: z.string().optional(),
});

export type LabAnalysisInput = z.infer<typeof labAnalysisSchema>;

// ============================================================================
// PRODUCTION SCHEMAS
// ============================================================================

export const productionLotSchema = z.object({
    code: z.string().min(1, 'Lot code is required'),
    product_id: z.string().uuid('Invalid product ID'),
    quantity_produced: z.number().positive('Quantity must be positive'),
    production_date: z.string().datetime('Invalid production date'),
    shift: z.string().optional(),
    production_line: z.string().optional(),
    status: z.enum(['active', 'completed', 'cancelled']).optional(),
    notes: z.string().optional(),
});

export type ProductionLotInput = z.infer<typeof productionLotSchema>;

export const intermediateLotSchema = z.object({
    code: z.string().min(1, 'Lot code is required'),
    production_lot_id: z.string().uuid('Invalid production lot ID'),
    tank_id: z.string().uuid('Invalid tank ID').optional(),
    quantity: z.number().positive('Quantity must be positive'),
    prepared_at: z.string().datetime('Invalid date').optional(),
    status: z.enum(['active', 'terminado', 'consumido']).optional(),
});

export type IntermediateLotInput = z.infer<typeof intermediateLotSchema>;

// ============================================================================
// TRAINING SCHEMAS
// ============================================================================

export const trainingSchema = z.object({
    title: z.string().min(1, 'Training title is required'),
    description: z.string().optional(),
    instructor: z.string().optional(),
    duration_hours: z.number().int().positive('Duration must be positive').optional(),
    date: z.string().optional(),
    status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});

export type TrainingInput = z.infer<typeof trainingSchema>;

export const trainingAssignmentSchema = z.object({
    training_id: z.string().uuid('Invalid training ID'),
    user_id: z.string().uuid('Invalid user ID'),
    assigned_date: z.string().datetime('Invalid date').optional(),
    completion_date: z.string().datetime('Invalid date').optional(),
    status: z.enum(['assigned', 'in_progress', 'completed', 'failed']).optional(),
    score: z.number().min(0).max(100, 'Score must be between 0 and 100').optional(),
});

export type TrainingAssignmentInput = z.infer<typeof trainingAssignmentSchema>;

// ============================================================================
// NON-CONFORMITY SCHEMAS
// ============================================================================

export const nonConformitySchema = z.object({
    code: z.string().min(1, 'NC code is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    category: z.enum(['product', 'process', 'material', 'personnel', 'other']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    status: z.enum(['open', 'investigating', 'resolved', 'closed']).optional(),
    detected_by: z.string().uuid('Invalid user ID'),
    detected_at: z.string().datetime('Invalid date').optional(),
    related_entity_type: z.string().optional(),
    related_entity_id: z.string().uuid().optional(),
});

export type NonConformityInput = z.infer<typeof nonConformitySchema>;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Safely parse and validate data with a schema
 * @throws ZodError with detailed validation errors
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}

/**
 * Safely validate data, returning success/error result
 */
export function safeValidateData<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.error };
}
