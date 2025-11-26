import { z } from "zod";
import { SAMPLE_STATUS, type SampleStatus } from "@/lib/constants/status";

// Supported sample types from URS (product, raw material, environmental)
export const sampleTypeEnum = z.enum([
    "finished_product",
    "intermediate_product",
    "raw_material",
    "environmental_swab",
    "equipment_swab",
    "personnel_swab",
    "water_sample",
    "air_sample",
    "other",
]);

export const samplePhaseEnum = z.enum(["intermediate", "finished"]);

const statusEnum = z.enum([
    SAMPLE_STATUS.PENDING,
    SAMPLE_STATUS.IN_ANALYSIS,
    SAMPLE_STATUS.UNDER_REVIEW,
    SAMPLE_STATUS.APPROVED,
    SAMPLE_STATUS.REJECTED,
]);

export const createSampleSchema = z
    .object({
        code: z.string().min(3).optional(), // generated server-side
        sample_type: sampleTypeEnum,
        phase: samplePhaseEnum.optional(),
        product_id: z.string().min(1).optional(),
        production_lot_id: z.string().min(1).optional(),
        intermediate_lot_id: z.string().min(1).optional(),
        tank_id: z.string().min(1).optional(),
        collected_at: z.coerce.date(),
        status: statusEnum.default(SAMPLE_STATUS.PENDING),
        observations: z.string().max(500).optional(),
        assigned_to: z.string().min(1).optional(),
    })
    .superRefine((values, ctx) => {
        const needsLot =
            values.sample_type === "finished_product" ||
            values.sample_type === "intermediate_product";

        if (needsLot) {
            if (!values.phase) {
                ctx.addIssue({
                    path: ["phase"],
                    code: z.ZodIssueCode.custom,
                    message: "Phase is required for product samples.",
                });
            }
            if (!values.product_id) {
                ctx.addIssue({
                    path: ["product_id"],
                    code: z.ZodIssueCode.custom,
                    message: "Product is required for product samples.",
                });
            }
            if (!values.tank_id) {
                ctx.addIssue({
                    path: ["tank_id"],
                    code: z.ZodIssueCode.custom,
                    message: "Tank is required for product samples.",
                });
            }
            if (values.phase === "intermediate" && !values.intermediate_lot_id) {
                ctx.addIssue({
                    path: ["intermediate_lot_id"],
                    code: z.ZodIssueCode.custom,
                    message: "Intermediate lot is required for intermediate samples.",
                });
            }
            if (values.phase === "finished" && !values.production_lot_id) {
                ctx.addIssue({
                    path: ["production_lot_id"],
                    code: z.ZodIssueCode.custom,
                    message: "Production lot is required for finished samples.",
                });
            }
        } else if (!values.observations) {
            ctx.addIssue({
                path: ["observations"],
                code: z.ZodIssueCode.custom,
                message: "Collection site is required for swabs and environmental samples.",
            });
        }
    });

export const updateSampleSchema = z.object({
    status: statusEnum.optional(),
    observations: z.string().max(500).optional(),
    assigned_to: z.string().min(1).optional(),
});

export const assignAnalystSchema = z.object({
    sampleId: z.string().min(1),
    analystId: z.string().min(1),
});

export const updateSampleStatusSchema = z.object({
    sampleId: z.string().min(1),
    status: statusEnum,
    comment: z.string().max(500).optional(),
});

export type CreateSampleInput = z.infer<typeof createSampleSchema>;
export type UpdateSampleInput = z.infer<typeof updateSampleSchema>;
export type AssignAnalystInput = z.infer<typeof assignAnalystSchema>;
export type UpdateSampleStatusInput = z.infer<typeof updateSampleStatusSchema>;
export type SampleType = z.infer<typeof sampleTypeEnum>;
export type SamplePhase = z.infer<typeof samplePhaseEnum>;
export type SampleStatusEnum = SampleStatus;
