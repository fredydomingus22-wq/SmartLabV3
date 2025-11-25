"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Factory,
    FlaskConical,
    FileText,
    ShieldCheck,
    AlertTriangle,
    ClipboardCheck,
    Users,
    Package,
    Settings,
    LineChart,
    Box,
    PackageCheck,
    Building2,
    GitBranch,
    TestTube,
    Boxes,
    Sparkles,
    Wrench,
    UserCog,
    TrendingUp,
    Warehouse,
} from "lucide-react";
import { SidebarGroup } from "./SidebarGroup";
// Role‑based UI helpers
import { useCurrentRole } from "@/lib/auth/role";
import { rolePermissions } from "@/lib/auth/rolePermissions";

// Define sidebar groups (unchanged list of modules)
const sidebarGroups = [
    {
        id: "production",
        name: "Produção",
        icon: Factory,
        items: [
            { name: "Lotes de Produção", href: "/production-lots", icon: Factory },
            { name: "Tanques / Produto Intermédio", href: "/intermediate-lots", icon: Boxes },
            { name: "Produto Final", href: "/finished-lots", icon: Package },
            { name: "Análises de Linha", href: "/line-analysis", icon: TestTube },
            { name: "Configurações de Produção", href: "/production-settings", icon: Settings },
        ],
        defaultExpanded: true,
    },
    {
        id: "materials",
        name: "Materials",
        icon: PackageCheck,
        items: [
            { name: "Raw Materials", href: "/raw-materials", icon: PackageCheck },
            { name: "Raw Material Lots", href: "/raw-material-lots", icon: Boxes },
            { name: "Products", href: "/products", icon: Box },
            { name: "Product Specs", href: "/product-specs", icon: FileText },
            { name: "Stock Movements", href: "/stock-movements", icon: TrendingUp },
        ],
        defaultExpanded: true,
    },
    {
        id: "supply-chain",
        name: "Supply Chain",
        icon: Building2,
        items: [
            { name: "Suppliers", href: "/suppliers", icon: Building2 },
            { name: "Inventory", href: "/inventory", icon: Warehouse },
        ],
    },
    {
        id: "laboratory",
        name: "Laboratory",
        icon: FlaskConical,
        items: [
            { name: "Sample Management", href: "/lab/samples", icon: TestTube },
            { name: "Lab Tests", href: "/lab-tests", icon: FlaskConical },
            { name: "Equipment", href: "/equipment", icon: Wrench },
            { name: "Reagents", href: "/reagents", icon: FlaskConical },
        ],
    },
    {
        id: "analytics",
        name: "Analytics",
        icon: LineChart,
        items: [
            { name: "SPC Engine", href: "/spc/dashboard", icon: LineChart },
            { name: "SPC War Room", href: "/spc/war-room", icon: Sparkles },
            { name: "Traceability", href: "/traceability", icon: GitBranch },
        ],
    },
    {
        id: "quality-safety",
        name: "Quality & Safety",
        icon: ShieldCheck,
        items: [
            { name: "Food Safety", href: "/food-safety", icon: ShieldCheck },
            { name: "Non-Conformities", href: "/nc", icon: AlertTriangle },
            { name: "Audits", href: "/audits", icon: ClipboardCheck },
        ],
    },
    {
        id: "system",
        name: "System",
        icon: Settings,
        items: [
            { name: "Form Builder", href: "/form-builder", icon: Sparkles },
            { name: "Documents", href: "/documents", icon: FileText },
            { name: "Trainings", href: "/trainings", icon: Users },
            { name: "Technicians", href: "/technicians", icon: UserCog },
            { name: "Reports", href: "/reports", icon: FileText },
            { name: "Admin Settings", href: "/admin/settings", icon: Settings },
            { name: "CIP Manager", href: "/cip-manager", icon: Wrench },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const role = useCurrentRole();
    // Determine allowed groups for the current role (fallback to empty array)
    const allowedGroupIds = role ? rolePermissions[role] ?? [] : [];
    const filteredGroups = sidebarGroups.filter((g) => allowedGroupIds.includes(g.id));

    return (
        <div className="fixed left-0 top-0 bottom-0 w-64 border-r border-slate-700 bg-slate-950 overflow-y-auto z-40">
            {/* Header with gradient */}
            <div className="sticky top-0 z-50 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950/80 backdrop-blur-sm border-b border-slate-800/50">
                <div className="px-6 py-5">
                    <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
                        SmartLab
                    </h1>
                    <p className="text-xs text-slate-500 tracking-wide uppercase mt-1">Enterprise</p>
                </div>
            </div>

            {/* Dashboard – Standalone */}
            <div className="px-4 pt-6 pb-2">
                <Link
                    href="/dashboard"
                    className={cn(
                        "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium",
                        "transition-all duration-200 relative group overflow-hidden",
                        pathname === "/dashboard"
                            ? "bg-emerald-500/10 text-emerald-400 font-semibold shadow-lg shadow-emerald-500/10"
                            : "text-slate-300 hover:text-slate-100 hover:bg-slate-800/50"
                    )}
                >
                    {/* Active indicator */}
                    {pathname === "/dashboard" && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-r" />
                    )}
                    {/* Hover gradient */}
                    <div
                        className={cn(
                            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                            "bg-gradient-to-r from-slate-800/0 via-slate-700/30 to-slate-800/0"
                        )}
                    />
                    <LayoutDashboard className={cn(
                        "mr-3 h-5 w-5 transition-all duration-200 relative z-10",
                        pathname === "/dashboard" ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300 group-hover:scale-110"
                    )}
                    />
                    <span className="relative z-10">Dashboard</span>
                    {/* Glow effect */}
                    {pathname === "/dashboard" && <div className="absolute inset-0 bg-emerald-500/5 blur-sm" />}
                </Link>
            </div>

            {/* Divider */}
            <div className="px-6 py-3">
                <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            </div>

            {/* Grouped Navigation */}
            <div className="px-4 pb-6 space-y-3">
                {filteredGroups.map((group) => (
                    <SidebarGroup
                        key={group.id}
                        id={group.id}
                        name={group.name}
                        icon={group.icon}
                        items={group.items}
                        defaultExpanded={group.defaultExpanded}
                    />
                ))}
            </div>

            {/* Bottom gradient fade */}
            <div className="sticky bottom-0 h-12 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
        </div>
    );
}

