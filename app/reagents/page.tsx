"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, BarChart3, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { getReagents } from "@/lib/queries/reagents";
import { ReagentWithStock } from "@/types/reagent";
import Link from "next/link";
import { ReagentsDataTable } from "@/components/reagents/ReagentsDataTable";
import { columns } from "@/components/reagents/columns";
import { ReagentEntryForm } from "@/components/reagents/ReagentEntryForm";
import { ReagentWithdrawalForm } from "@/components/reagents/ReagentWithdrawalForm";

export default function ReagentsPage() {
    const [reagents, setReagents] = useState<ReagentWithStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReagent, setSelectedReagent] = useState<ReagentWithStock | null>(null);
    const [entryFormOpen, setEntryFormOpen] = useState(false);
    const [withdrawalFormOpen, setWithdrawalFormOpen] = useState(false);

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
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSelectedReagent(null);
                                    setWithdrawalFormOpen(true);
                                }}
                                className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                            >
                                <ArrowUpFromLine className="w-4 h-4 mr-2" />
                                Withdraw
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSelectedReagent(null);
                                    setEntryFormOpen(true);
                                }}
                                className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                            >
                                <ArrowDownToLine className="w-4 h-4 mr-2" />
                                Entry
                            </Button>
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
                            <ReagentsDataTable 
                                columns={columns} 
                                data={reagents}
                                onWithdraw={(reagent) => {
                                    setSelectedReagent(reagent);
                                    setWithdrawalFormOpen(true);
                                }}
                                onEntry={(reagent) => {
                                    setSelectedReagent(reagent);
                                    setEntryFormOpen(true);
                                }}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Entry & Withdrawal Forms */}
                <ReagentEntryForm
                    open={entryFormOpen}
                    onOpenChange={setEntryFormOpen}
                    reagent={selectedReagent}
                    onSuccess={fetchReagents}
                />
                <ReagentWithdrawalForm
                    open={withdrawalFormOpen}
                    onOpenChange={setWithdrawalFormOpen}
                    reagent={selectedReagent}
                    onSuccess={fetchReagents}
                />
            </div>
        </AppShell>
    );
}

