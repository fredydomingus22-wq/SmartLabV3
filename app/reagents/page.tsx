'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';
import { FlaskConical, AlertTriangle, Plus, Calendar } from 'lucide-react';
import { getReagents, createReagent } from '@/lib/queries/reagents';
import { ReagentWithStock } from '@/types/reagent';

export default function ReagentsPage() {
    const [reagents, setReagents] = useState<ReagentWithStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        category: 'other' as const,
        storage_location: '',
        unit: 'mL',
        stock_current: 0,
        stock_min: 0,
        status: 'active' as const
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createReagent(formData);
            toast.success("Reagent added successfully");
            setDialogOpen(false);
            fetchReagents();
            setFormData({
                code: '',
                name: '',
                category: 'other',
                storage_location: '',
                unit: 'mL',
                stock_current: 0,
                stock_min: 0,
                status: 'active'
            });
        } catch (error) {
            console.error("Error creating reagent:", error);
            toast.error("Failed to add reagent");
        }
    };

    const isExpiringSoon = (expiryDate: string) => {
        const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    };

    const isExpired = (expiryDate: string) => {
        return new Date(expiryDate) < new Date();
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const expiringCount = reagents.filter(r => isExpiringSoon(r.expiry_date)).length;
    const expiredCount = reagents.filter(r => isExpired(r.expiry_date)).length;
    const lowStockCount = reagents.filter(r => r.stock_level < 100).length;

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Reagents Management"
                    description="Track reagent inventory, expiry dates, and usage"
                    action={
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Reagent
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add New Reagent</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Reagent Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., Sulfuric Acid"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="stock_level">Stock Level *</Label>
                                            <Input
                                                id="stock_level"
                                                type="number"
                                                value={formData.stock_level}
                                                onChange={(e) => setFormData({ ...formData, stock_level: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="unit">Unit</Label>
                                            <Input
                                                id="unit"
                                                value={formData.unit}
                                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                                placeholder="mL, g, L"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry_date">Expiry Date *</Label>
                                        <Input
                                            id="expiry_date"
                                            type="date"
                                            value={formData.expiry_date}
                                            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">Add Reagent</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    }
                />

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reagents</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reagents.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-red-600/50 bg-red-900/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Expired
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{expiredCount}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-600/50 bg-yellow-900/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-yellow-600">Expiring Soon</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{expiringCount}</div>
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
                                    <TableHead>Name</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Expiry Date</TableHead>
                                    <TableHead>Last Used</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                                    </TableRow>
                                ) : reagents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No reagents registered
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reagents.map((reagent) => (
                                        <TableRow key={reagent.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FlaskConical className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium">{reagent.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={reagent.stock_level < 100 ? "text-amber-600 font-medium" : ""}>
                                                    {reagent.stock_level} {reagent.unit}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                                    {formatDate(reagent.expiry_date)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(reagent.last_used)}
                                            </TableCell>
                                            <TableCell>
                                                {isExpired(reagent.expiry_date) ? (
                                                    <Badge className="bg-red-600">Expired</Badge>
                                                ) : isExpiringSoon(reagent.expiry_date) ? (
                                                    <Badge className="bg-yellow-600">Expiring Soon</Badge>
                                                ) : (
                                                    <Badge className="bg-green-600">Active</Badge>
                                                )}
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
