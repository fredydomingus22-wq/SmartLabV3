'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';
import { FlaskConical } from 'lucide-react';
import { getReagents } from '@/lib/queries/reagents';
import { ReagentWithStock } from '@/types/reagent';
import Link from 'next/link';

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

    const lowStockCount = reagents.filter(r => r.low_stock).length;

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Reagents Management"
                    description="Track reagent inventory, expiry dates, and usage"
                    action={
                        <Link href="/reagents/create">
                            <Button>Add Reagent</Button>
                        </Link>
                    }
                />

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reagents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reagents.length}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-600/50 bg-amber-900/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-amber-600">Low Stock</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{lowStockCount}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Reagents Inventory</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                                    </TableRow>
                                ) : reagents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No reagents registered
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reagents.map((reagent) => (
                                        <TableRow key={reagent.id}>
                                            <TableCell className="font-mono">{reagent.code}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FlaskConical className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium">{reagent.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={reagent.low_stock ? "text-amber-600 font-medium" : ""}>
                                                    {reagent.stock_current} {reagent.unit}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm">{reagent.storage_location}</TableCell>
                                            <TableCell>
                                                {reagent.low_stock ? (
                                                    <Badge className="bg-red-600">Low Stock</Badge>
                                                ) : (
                                                    <Badge className="bg-green-600">Normal</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/reagents/${reagent.id}`}>
                                                    <Button variant="ghost" size="sm">View</Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
