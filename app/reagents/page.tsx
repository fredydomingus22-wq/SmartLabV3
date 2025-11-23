"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, BarChart3, Download } from "lucide-react";
import { getReagents } from "@/lib/queries/reagents";
import { ReagentWithStock } from "@/types/reagent";
import Link from "next/link";
import { ReagentsDataTable } from "@/components/reagents/ReagentsDataTable";
import { columns } from "@/components/reagents/columns";

export default function ReagentsPage() {
    const [reagents, setReagents] = useState<ReagentWithStock[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReagents();
    }, []);

    const fetchReagents = async () => {
        try {
            const data = await getReagents();
            setReagents(data);
        } catch (error) {
            console.error("Error fetching reagents:", error);
            toast.error("Failed to load reagents");
        } finally {
            setLoading(false);
        }
    };

    const lowStockCount = reagents.filter((r) => r.low_stock).length;
    const expiringCount = 3; // Mock for now, implement real logic later

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Reagents Management"
                    description="Track reagent inventory, expiry dates, and usage"
                    action={
                        <div className="flex gap-2">
                            <Link href="/reagents/analytics">
                                <Button variant="outline">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Analytics
                                </Button>
                            </Link>
                            <Link href="/reagents/create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Reagent
                                </Button>
                            </Link>
                        </div>
                    }
                />

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Reagents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reagents.length}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-amber-500">
                                Low Stock
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-500">
                                {lowStockCount}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-500">
                                Expiring Soon
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500">
                                {expiringCount}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Next 30 days
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-500">
                                Value
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-500">$12.4k</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Total Inventory
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Advanced Data Table */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle>Reagents Inventory</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-10">Loading inventory...</div>
                        ) : (
                            <ReagentsDataTable columns={columns} data={reagents} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}

