import * as z from "zod"

export const productionLotSchema = z.object({
    code: z.string().min(3, {
        message: "O código do lote deve ter pelo menos 3 caracteres.",
    }),
    product_id: z.string({
        required_error: "Por favor selecione um produto.",
    }),
    factory_id: z.string().optional(),
    production_line: z.string().optional(),
    shift: z.string().optional(),
    status: z.enum(["open", "closed", "blocked"]).default("open"),
})

export type ProductionLotFormValues = z.infer<typeof productionLotSchema>
