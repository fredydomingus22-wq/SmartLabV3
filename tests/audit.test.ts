import { fetchAuditLog } from "@/lib/queries/audit";
import { createClient } from "@/lib/supabase/client";
import { AuditEntry } from "@/types/audit";

jest.mock("@/lib/supabase/client", () => ({
    createClient: jest.fn(),
}));

const rpcMock = jest.fn();

describe("fetchAuditLog", () => {
    beforeEach(() => {
        rpcMock.mockReset();
        (createClient as jest.Mock).mockReturnValue({ rpc: rpcMock });
    });

    it("calls Supabase RPC with table and row identifiers", async () => {
        const mockData: AuditEntry[] = [
            {
                id: "1",
                table_name: "production_lots",
                operation: "INSERT",
                row_id: "row-1",
                old_data: null,
                new_data: { code: "PL-001" },
                performed_by: "user-1",
                performed_at: "2024-01-01T00:00:00Z",
            },
        ];

        rpcMock.mockResolvedValue({ data: mockData, error: null });

        const result = await fetchAuditLog("production_lots", "row-1");

        expect(createClient).toHaveBeenCalledTimes(1);
        expect(rpcMock).toHaveBeenCalledWith("fetch_audit_log", {
            p_row_id: "row-1",
            p_table_name: "production_lots",
        });
        expect(result).toEqual(mockData);
    });

    it("throws when Supabase returns an error", async () => {
        rpcMock.mockResolvedValue({ data: null, error: new Error("rpc failed") });

        await expect(fetchAuditLog("samples", "row-99")).rejects.toThrow("rpc failed");
    });
});
