'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { getRawMaterialLots, getRawMaterials } from '@/lib/queries/inventory';
import { RawMaterialLot, RawMaterial } from '@/types/inventory';

export default function InventoryPage() {
    const [rmLots, setRmLots] = useState<RawMaterialLot[]>([]);
    const [materials, setMaterials] = useState<RawMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [lotsData, materialsData] = await Promise.all([
                getRawMaterialLots(),
                getRawMaterials()
            ]);
            setRmLots(lotsData);
            setMaterials(materialsData);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    const getLowStockCount = () => {
        let count = 0;
        materials.forEach(mat => {
            if (!mat.min_stock_level) return;
            const totalStock = rmLots
                .filter(lot => lot.raw_material_id === mat.id)
                .reduce((sum, lot) => sum + (lot.quantity || 0), 0);

            if (totalStock < mat.min_stock_level) count++;
        });
        return count;
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Inventory Management"
                    description="Track raw materials, finished goods, and stock movements."
                    action={
                        <Button onClick={() => router.push('/inventory/movements')}>
                            <ArrowRightLeft className="mr-2 h-4 w-4" />
                            Stock Movement
                        </Button>
                    }
                />

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Raw Materials</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{materials.length} Items</div>
                            <p className="text-xs text-muted-foreground">{rmLots.length} active lots</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{getLowStockCount()}</div>
                            <p className="text-xs text-muted-foreground">Items below threshold</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="raw-materials" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="raw-materials">Raw Materials</TabsTrigger>
                        <TabsTrigger value="finished-goods">Finished Goods</TabsTrigger>
                    </TabsList>

                    <TabsContent value="raw-materials">
                        <Card>
                            <CardHeader>
                                <CardTitle>Raw Material Lots</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Lot Code</TableHead>
                                            <TableHead>Material</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Received Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rmLots.map((lot) => (
                                            <TableRow key={lot.id}>
                                                <TableCell className="font-medium">{lot.lot_code}</TableCell>
                                                <TableCell>{lot.raw_material?.name}</TableCell>
                                                <TableCell>{lot.quantity} {lot.unit}</TableCell>
                                                <TableCell>
                                                    <Badge variant={lot.status === 'approved' ? 'default' : 'secondary'}>
                                                        {lot.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{lot.received_date || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="finished-goods">
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                Finished Goods Inventory Coming Soon
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppShell>
    );
}
