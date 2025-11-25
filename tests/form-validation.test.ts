import { productionLotSchema } from "@/lib/validations/production";

describe("productionLotSchema", () => {
    it("accepts a valid production lot payload", () => {
        const result = productionLotSchema.safeParse({
            code: "PL-2024-001",
            product_id: "prod-1",
            factory_id: "factory-1",
            production_line: "Line A",
            shift: "A",
            status: "open",
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.code).toBe("PL-2024-001");
        }
    });

    it("rejects invalid payloads", () => {
        const result = productionLotSchema.safeParse({
            code: "P",
            // @ts-expect-error testing missing product_id
            product_id: undefined,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            const issuePaths = result.error.issues.map((issue) => issue.path[0]);
            expect(issuePaths).toContain("code");
            expect(issuePaths).toContain("product_id");
        }
    });
});
