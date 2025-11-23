"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ReagentWithStock } from "@/types/reagent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Eye, FlaskConical, AlertTriangle, Skull, Flame, Droplets } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import Link from "next/link";

// Helper to get hazard icon
const getHazardIcon = (hazardClass: string) => {
    switch (hazardClass?.toLowerCase()) {
        case "flammable": return <Flame className="w-4 h-4 text-red-500" />;
        case "toxic": return <Skull className="w-4 h-4 text-slate-900 dark:text-slate-100" />;
        case "corrosive": return <FlaskConical className="w-4 h-4 text-orange-500" />;
        case "oxidizer": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
        default: return null;
    }
};

export const columns: ColumnDef<ReagentWithStock>[] = [
    {
        accessorKey: "code",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Code
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => <div className="font-mono font-medium">{row.getValue("code")}</div>,
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const hazard = row.original.hazard_class || "";
            const reagent = row.original;

            return (
                <HoverCard>
                    <HoverCardTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer">
                            {getHazardIcon(hazard)}
                            <span className="font-medium hover:underline">{reagent.name}</span>
                        </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                        <div className="flex justify-between space-x-4">
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold">{reagent.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {reagent.description || "No description available."}
                                </p>
                                <div className="flex items-center pt-2">
                                    <span className="text-xs text-muted-foreground">
                                        CAS: {reagent.cas_number || "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </HoverCardContent>
                </HoverCard >
            );
        },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.getValue("category")}</Badge>,
    },
    {
        accessorKey: "stock_current",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Stock
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const stock = parseFloat(row.getValue("stock_current"));
            const unit = row.original.unit;
            const isLow = row.original.low_stock;

            return (
                <div className={`font-medium ${isLow ? "text-red-500" : "text-green-500"}`}>
                    {stock} {unit}
                </div>
            );
        },
    },
    {
        accessorKey: "storage_location",
        header: "Location",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const isLow = row.original.low_stock;
            return (
                <Badge className={isLow ? "bg-red-600" : "bg-green-600"}>
                    {isLow ? "Low Stock" : "Normal"}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const reagent = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(reagent.code)}
                        >
                            Copy Code
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Link href={`/reagents/${reagent.id}`}>
                            <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem>
                            <Droplets className="mr-2 h-4 w-4" />
                            Quick Withdrawal
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
