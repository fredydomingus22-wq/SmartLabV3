// Validation schemas for Sample entity using Zod

// Types representing sample phases and types used throughout the UI
export type SamplePhase = "intermediate" | "finished";
export type SampleType =
    | "finished_product"
    | "intermediate_product"
    | "raw_material"
    | "environmental_swab"
    | "equipment_swab"
    | "personnel_swab"
    | "water_sample"
    | "air_sample"
    | "other";

// Aligns with SAMPLE_STATUS constants defined in lib/constants/status.ts
import { z } from "zod";
import { SAMPLE_STATUS } from "@/lib/constants/status";

// Helper to get allowed status values from the constant object
const SampleStatusEnum = z.enum(Object.values(SAMPLE_STATUS) as [string, ...string[]]);

export const createSampleSchema = z.object({
    code: z.string().min(1, "Sample code is required"),
    sample_type: z.string().min(1, "Sample type is required"),
    status: SampleStatusEnum.optional().default(SAMPLE_STATUS.PENDING),
    collected_at: z.string().datetime({ offset: true }).optional(),
    product_id: z.string().uuid().nullable().optional(),
    production_lot_id: z.string().uuid().nullable().optional(),
    assigned_to: z.string().uuid().nullable().optional(),
    tenant_id: z.string().uuid().optional(),
});

export const updateSampleSchema = z.object({
    id: z.string().uuid(),
    code: z.string().min(1).optional(),
    sample_type: z.string().min(1).optional(),
    status: SampleStatusEnum.optional(),
    collected_at: z.string().datetime({ offset: true }).optional(),
    product_id: z.string().uuid().nullable().optional(),
    production_lot_id: z.string().uuid().nullable().optional(),
    assigned_to: z.string().uuid().nullable().optional(),
    tenant_id: z.string().uuid().optional(),
});

export const assignAnalystSchema = z.object({
    sampleId: z.string().uuid(),
    analystId: z.string().uuid(),
});
