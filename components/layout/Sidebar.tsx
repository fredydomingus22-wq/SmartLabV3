"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
    Sparkles
} from "lucide-react"
import { SidebarGroup } from "./SidebarGroup"

// Define sidebar groups with their items
const sidebarGroups = [
    {
        id: "production",
        name: "Production",
        icon: Factory,
        items: [
            { name: "Production Lots", href: "/production-lots", icon: Factory },
            { name: "Intermediate Lots", href: "/intermediate-lots", icon: Boxes },
            { name: "Finished Lots", href: "/finished-lots", icon: Package },
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
        ],
        defaultExpanded: true,
    },
    {
        id: "supply-chain",
        name: "Supply Chain",
        icon: Building2,
        items: [
            { name: "Suppliers", href: "/suppliers", icon: Building2 },
        ],
    },
    {
        id: "laboratory",
        name: "Laboratory",
        icon: FlaskConical,
        items: [
            { name: "Sample Management", href: "/lab/samples", icon: TestTube },
            { name: "Lab Tests", href: "/lab-tests", icon: FlaskConical },
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
            { name: "Food Safety", href: "/food-safety/pcc", icon: ShieldCheck },
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
        ],
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="fixed left-0 top-0 bottom-0 w-64 border-r border-slate-700 bg-slate-950 overflow-y-auto z-40">
            {/* Header with gradient */}
            <div className="sticky top-0 z-50 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950/80 backdrop-blur-sm border-b border-slate-800/50">
                <div className="px-6 py-5">
                    <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
                        SmartLab
                    </h1>
                    <p className="text-xs text-slate-500 tracking-wide uppercase mt-1">
                        Enterprise
                    </p>
                </div>
            </div>

            {/* Dashboard - Standalone */}
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
                    <div className={cn(
                        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        "bg-gradient-to-r from-slate-800/0 via-slate-700/30 to-slate-800/0"
                    )} />

                    <LayoutDashboard className={cn(
                        "mr-3 h-5 w-5 transition-all duration-200 relative z-10",
                        pathname === "/dashboard"
                            ? "text-emerald-400"
                            : "text-slate-500 group-hover:text-slate-300 group-hover:scale-110"
                    )} />
                    <span className="relative z-10">Dashboard</span>

                    {/* Glow effect */}
                    {pathname === "/dashboard" && (
                        <div className="absolute inset-0 bg-emerald-500/5 blur-sm" />
                    )}
                </Link>
            </div>

            {/* Divider */}
            <div className="px-6 py-3">
                <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            </div>

            {/* Grouped Navigation */}
            <div className="px-4 pb-6 space-y-3">
                {sidebarGroups.map((group) => (
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
    )
}
