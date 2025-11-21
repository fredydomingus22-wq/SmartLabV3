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
    History,
    Package,
    Settings,
    LineChart,
    Box,
    PackageCheck,
    Building2
} from "lucide-react"

const sidebarItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/products", icon: Box },
    { name: "Production Lots", href: "/production-lots", icon: Factory },
    { name: "Intermediate Lots", href: "/intermediate-lots", icon: FlaskConical },
    { name: "Finished Lots", href: "/finished-lots", icon: Package },
    { name: "Raw Materials", href: "/raw-materials", icon: PackageCheck },
    { name: "Raw Material Lots", href: "/raw-material-lots", icon: PackageCheck },
    { name: "Suppliers", href: "/suppliers", icon: Building2 },
    { name: "Lab Tests", href: "/lab-tests", icon: FlaskConical },
    { name: "SPC Engine", href: "/spc/dashboard", icon: LineChart },
    { name: "Food Safety", href: "/food-safety/pcc", icon: ShieldCheck },
    { name: "Non-Conformities", href: "/nc", icon: AlertTriangle },
    { name: "Audits", href: "/audits", icon: ClipboardCheck },
    { name: "Form Builder", href: "/form-builder", icon: Settings },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Trainings", href: "/trainings", icon: Users },
    { name: "Traceability", href: "/traceability", icon: History },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="pb-12 w-64 border-r min-h-screen bg-card">
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        SmartLab
                    </h2>
                    <div className="space-y-1">
                        {sidebarItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                    pathname?.startsWith(item.href) ? "bg-accent text-accent-foreground" : "transparent"
                                )}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
