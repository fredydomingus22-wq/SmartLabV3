import { fetchAuditLog, getAuditLogs } from "@/lib/queries/audit";
import { createClient } from "@/lib/supabase/client";
import { AuditEntry } from "@/types/audit";

jest.mock("@/lib/supabase/client", () => ({
    createClient: jest.fn(),
}));

const rpcMock = jest.fn();
const fromMock = jest.fn();
const selectMock = jest.fn();
const orderMock = jest.fn();
const limitMock = jest.fn();

describe("fetchAuditLog", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (createClient as jest.Mock).mockReturnValue({
            rpc: rpcMock,
            from: fromMock,
        });
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

    it("retrieves audit logs ordered by performed_at", async () => {
        const mockData: AuditEntry[] = [
            {
                id: "1",
                table_name: "audit_log",
                operation: "INSERT",
                row_id: "row-1",
                old_data: null,
                new_data: { foo: "bar" },
                performed_by: "user-1",
                performed_at: "2024-01-01T00:00:00Z",
            },
        ];

        limitMock.mockResolvedValue({ data: mockData, error: null });
        orderMock.mockReturnValue({ limit: limitMock });
        selectMock.mockReturnValue({ order: orderMock });
        fromMock.mockReturnValue({ select: selectMock });

        const result = await getAuditLogs(10);

        expect(fromMock).toHaveBeenCalledWith("audit_log");
        expect(selectMock).toHaveBeenCalledWith("*");
        expect(orderMock).toHaveBeenCalledWith("performed_at", { ascending: false });
        expect(limitMock).toHaveBeenCalledWith(10);
        expect(result).toEqual(mockData);
    });

    it("throws when audit log query returns an error", async () => {
        const queryError = new Error("select failed");
        limitMock.mockResolvedValue({ data: null, error: queryError });
        orderMock.mockReturnValue({ limit: limitMock });
        selectMock.mockReturnValue({ order: orderMock });
        fromMock.mockReturnValue({ select: selectMock });

        await expect(getAuditLogs()).rejects.toThrow("select failed");
    });
});
