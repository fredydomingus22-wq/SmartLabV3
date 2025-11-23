"use client"

import { useState, useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    ColumnDef,
    flexRender,
    SortingState,
    ColumnFiltersState,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SpecAggregated } from "@/lib/queries/product-specs";
import { Search, ArrowUpDown, Eye, Edit, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface AllSpecsTableProps {
    specs: SpecAggregated[];
}

export function AllSpecsTable({ specs }: AllSpecsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");

    // Custom filters
    const [productTypeFilter, setProductTypeFilter] = useState<string>("all");
    const [testLevelFilter, setTestLevelFilter] = useState<string>("all");
    const [criticalFilter, setCriticalFilter] = useState<string>("all");

    const columns = useMemo<ColumnDef<SpecAggregated>[]>(
        () => [
            {
                accessorKey: "product_name",
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            Product
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    );
                },
                cell: ({ row }) => (
                    <div>
                        <div className="font-medium">{row.original.product_name}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                            {row.original.product_sku}
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: "parameter_name",
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            Parameter
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    );
                },
                cell: ({ row }) => (
                    <div>
                        <div className="font-medium">{row.original.parameter_name}</div>
                        {row.original.parameter_category && (
                            <Badge variant="outline" className="text-xs mt-1">
                                {row.original.parameter_category}
                            </Badge>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: "spec_min",
                header: "Min",
                cell: ({ row }) => (
                    <div className="text-center">
                        {row.original.spec_min !== null ? row.original.spec_min : "-"}
                    </div>
                ),
            },
            {
                accessorKey: "spec_target",
                header: "Target",
                cell: ({ row }) => (
                    <div className="text-center font-medium">
                        {row.original.spec_target !== null ? row.original.spec_target : "-"}
                    </div>
                ),
            },
            {
                accessorKey: "spec_max",
                header: "Max",
                cell: ({ row }) => (
                    <div className="text-center">
                        {row.original.spec_max !== null ? row.original.spec_max : "-"}
                    </div>
                ),
            },
            {
                accessorKey: "unit",
                header: "Unit",
                cell: ({ row }) => (
                    <div className="text-center">
                        {row.original.unit ? (
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                {row.original.unit}
                            </code>
                        ) : (
                            "-"
                        )}
                    </div>
                ),
            },
            {
                accessorKey: "test_frequency",
                header: "Frequency",
                cell: ({ row }) => (
                    <div className="text-xs">
                        {row.original.test_frequency ? (
                            <Badge variant="secondary" className="capitalize">
                                {row.original.test_frequency.replace("_", " ")}
                            </Badge>
                        ) : (
                            "-"
                        )}
                    </div>
                ),
            },
            {
                accessorKey: "test_level",
                header: "Level",
                cell: ({ row }) => (
                    <div className="text-xs">
                        {row.original.test_level ? (
                            <Badge variant="outline" className="capitalize">
                                {row.original.test_level.replace("_", " ")}
                            </Badge>
                        ) : (
                            "-"
                        )}
                    </div>
                ),
            },
            {
                accessorKey: "is_critical",
                header: "Critical",
                cell: ({ row }) => (
                    <div className="text-center">
                        {row.original.is_critical ? (
                            <Badge variant="destructive" className="text-xs">
                                Critical
                            </Badge>
                        ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                        )}
                    </div>
                ),
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <div className="flex gap-1">
                        <Link href={`/products/${row.original.product_id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                ),
            },
        ],
        []
    );

    // Apply custom filters
    const filteredSpecs = useMemo(() => {
        let filtered = specs;

        if (productTypeFilter !== "all") {
            filtered = filtered.filter((s) => s.product_type === productTypeFilter);
        }

        if (testLevelFilter !== "all") {
            filtered = filtered.filter((s) => s.test_level === testLevelFilter);
        }

        if (criticalFilter === "critical") {
            filtered = filtered.filter((s) => s.is_critical === true);
        } else if (criticalFilter === "non-critical") {
            filtered = filtered.filter((s) => !s.is_critical);
        }

        return filtered;
    }, [specs, productTypeFilter, testLevelFilter, criticalFilter]);

    const table = useReactTable({
        data: filteredSpecs,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        initialState: {
            pagination: {
                pageSize: 20,
            },
        },
    });

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Global Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search product or parameter..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Product Type Filter */}
                <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="beverage">Beverage</SelectItem>
                        <SelectItem value="syrup">Syrup</SelectItem>
                        <SelectItem value="concentrate">Concentrate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>

                {/* Test Level Filter */}
                <Select value={testLevelFilter} onValueChange={setTestLevelFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="incoming">Incoming</SelectItem>
                        <SelectItem value="in_process">In Process</SelectItem>
                        <SelectItem value="finished">Finished</SelectItem>
                        <SelectItem value="line">Line</SelectItem>
                    </SelectContent>
                </Select>

                {/* Critical Filter */}
                <Select value={criticalFilter} onValueChange={setCriticalFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Specs</SelectItem>
                        <SelectItem value="critical">Critical Only</SelectItem>
                        <SelectItem value="non-critical">Non-Critical</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
                Showing {table.getFilteredRowModel().rows.length} of {specs.length} specifications
            </div>

            {/* Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No specifications found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
