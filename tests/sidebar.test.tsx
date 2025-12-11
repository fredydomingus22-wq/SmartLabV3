import { render, screen, fireEvent } from "@testing-library/react";
import { FlaskConical } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarGroup } from "@/components/layout/SidebarGroup";
import { usePathname } from "next/navigation";
import { useCurrentRole } from "@/lib/auth/role";

jest.mock("next/navigation", () => ({
    usePathname: jest.fn(),
}));

jest.mock("@/lib/auth/role", () => ({
    useCurrentRole: jest.fn(),
}));

const usePathnameMock = usePathname as jest.Mock;
const useCurrentRoleMock = useCurrentRole as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Sidebar", () => {
    it("renders technician groups and highlights dashboard", () => {
        usePathnameMock.mockReturnValue("/dashboard");
        useCurrentRoleMock.mockReturnValue("technician");

        render(<Sidebar />);

        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Produção")).toBeInTheDocument();
        expect(screen.queryByText("Supply Chain")).not.toBeInTheDocument();
    });

    it("hides groups when no role is available", () => {
        usePathnameMock.mockReturnValue("/production-lots");
        useCurrentRoleMock.mockReturnValue(null);

        render(<Sidebar />);

        expect(screen.queryByText("Produção")).not.toBeInTheDocument();
        expect(screen.queryByText("Materials")).not.toBeInTheDocument();
    });
});

describe("SidebarGroup", () => {
    it("toggles expansion state and highlights active item", () => {
        usePathnameMock.mockReturnValue("/lab/samples");
        const items = [{ name: "Samples", href: "/lab/samples", icon: FlaskConical }];

        render(
            <SidebarGroup
                id="lab"
                name="Laboratory"
                icon={FlaskConical}
                items={items}
                defaultExpanded={false}
            />
        );

        const toggleButton = screen.getByRole("button", { name: /Laboratory/i });
        expect(toggleButton).toHaveAttribute("aria-expanded", "false");

        fireEvent.click(toggleButton);

        expect(toggleButton).toHaveAttribute("aria-expanded", "true");
        const activeLink = screen.getByText("Samples").closest("a");
        expect(activeLink).toHaveClass("bg-emerald-500/10");
    });
});
