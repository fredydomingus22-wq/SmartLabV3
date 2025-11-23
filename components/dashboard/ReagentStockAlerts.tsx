"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FlaskConical, Calendar, ArrowRight } from "lucide-react";
import { getLowStockReagents, getExpiringBatches } from "@/lib/queries/reagents";
import { ReagentWithStock, ReagentBatch } from "@/types/reagent";
import Link from "next/link";

export function ReagentStockAlerts() {
    const [lowStock, setLowStock] = useState<ReagentWithStock[]>([]);
    const [expiringBatches, setExpiringBatches] = useState<ReagentBatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [lowStockData, expiringData] = await Promise.all([
                getLowStockReagents(),
                getExpiringBatches(30), // Next 30 days
            ]);
            setLowStock(lowStockData);
            setExpiringBatches(expiringData);
        } catch (error) {
            console.error("Error loading reagent alerts:", error);
        } finally {
            setLoading(false);
        }
    }

    const totalAlerts = lowStock.length + expiringBatches.length;

    if (loading) {
        return (
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FlaskConical className="w-5 h-5 text-blue-500" />
                        Reagent Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FlaskConical className="w-5 h-5 text-blue-500" />
                        Reagent Alerts
                    </CardTitle>
                    {totalAlerts > 0 && (
                        <Badge className="bg-red-600">
                            {totalAlerts} Alert{totalAlerts !== 1 ? "s" : ""}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Low Stock Section */}
                {lowStock.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-red-400">
                            <AlertTriangle className="w-4 h-4" />
                            Low Stock ({lowStock.length})
                        </div>
                        <div className="space-y-2">
                            {lowStock.slice(0, 3).map((reagent) => (
                                <Link
                                    key={reagent.id}
                                    href={`/reagents/${reagent.id}`}
                                    className="block"
                                >
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-950/30 border border-red-900/50 hover:bg-red-950/50 transition-colors cursor-pointer">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{reagent.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {reagent.code}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-red-400">
                                                {reagent.stock_current} {reagent.unit}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Min: {reagent.stock_min} {reagent.unit}
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 ml-2 text-muted-foreground" />
                                    </div>
                                </Link>
                            ))}
                            {lowStock.length > 3 && (
                                <Link href="/reagents">
                                    <Button variant="ghost" size="sm" className="w-full text-xs">
                                        View all {lowStock.length} low stock reagents
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Expiring Batches Section */}
                {expiringBatches.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-yellow-400">
                            <Calendar className="w-4 h-4" />
                            Expiring Soon ({expiringBatches.length})
                        </div>
                        <div className="space-y-2">
                            {expiringBatches.slice(0, 3).map((batch) => {
                                const daysUntilExpiry = Math.ceil(
                                    (new Date(batch.expiration_date).getTime() - Date.now()) /
                                    (1000 * 60 * 60 * 24)
                                );
                                const isUrgent = daysUntilExpiry <= 7;

                                return (
                                    <Link
                                        key={batch.id}
                                        href={`/reagents/${batch.reagent_id}`}
                                        className="block"
                                    >
                                        <div
                                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${isUrgent
                                                    ? "bg-red-950/30 border-red-900/50 hover:bg-red-950/50"
                                                    : "bg-yellow-950/30 border-yellow-900/50 hover:bg-yellow-950/50"
                                                }`}
                                        >
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">
                                                    Batch {batch.batch_number}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Lot {batch.lot_number}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div
                                                    className={`text-sm font-bold ${isUrgent ? "text-red-400" : "text-yellow-400"
                                                        }`}
                                                >
                                                    {daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(batch.expiration_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 ml-2 text-muted-foreground" />
                                        </div>
                                    </Link>
                                );
                            })}
                            {expiringBatches.length > 3 && (
                                <Link href="/reagents">
                                    <Button variant="ghost" size="sm" className="w-full text-xs">
                                        View all {expiringBatches.length} expiring batches
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* No Alerts */}
                {totalAlerts === 0 && (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-950/30 mb-3">
                            <FlaskConical className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="text-sm font-medium">All reagents in good condition</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            No low stock or expiring batches
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
