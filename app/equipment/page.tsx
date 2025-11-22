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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getEquipment, createEquipment, getCalibrationDueEquipment } from '@/lib/queries/equipment';
import { Equipment } from '@/types/equipment';
import { toast } from 'sonner';
import { Wrench, AlertTriangle, Plus, Calendar } from 'lucide-react';

export default function EquipmentPage() {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [calibrationDue, setCalibrationDue] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: '',
        manufacturer: '',
        model: '',
        serial_number: '',
        location: '',
        status: 'active' as Equipment['status']
    });

    useEffect(() => {
        fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        try {
            const [allEquipment, dueEquipment] = await Promise.all([
                getEquipment(),
                getCalibrationDueEquipment()
            ]);
            setEquipment(allEquipment);
            setCalibrationDue(dueEquipment);
        } catch (error) {
            console.error("Error fetching equipment:", error);
            toast.error("Failed to load equipment");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createEquipment(formData);
            toast.success("Equipment added successfully");
            setDialogOpen(false);
            fetchEquipment();
            setFormData({
                name: '',
                code: '',
                type: '',
                manufacturer: '',
                model: '',
                serial_number: '',
                location: '',
                status: 'active'
            });
        } catch (error) {
            console.error("Error creating equipment:", error);
            toast.error("Failed to add equipment");
        }
    };

    const getStatusBadge = (status: Equipment['status']) => {
        switch (status) {
            case 'active': return <Badge className="bg-green-600">Active</Badge>;
            case 'inactive': return <Badge variant="secondary">Inactive</Badge>;
            case 'maintenance': return <Badge className="bg-amber-600">Maintenance</Badge>;
            case 'calibration_due': return <Badge className="bg-red-600">Calibration Due</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <AppShell>
            <div className="p-6 space-y-6">
                <SectionHeader
                    title="Equipment Management"
                    description="Track and manage laboratory equipment and calibrations"
                    action={
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Equipment
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Add New Equipment</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Equipment Name *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="code">Code *</Label>
                                            <Input
                                                id="code"
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Type *</Label>
                                            <Input
                                                id="type"
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                placeholder="e.g., pH Meter, Balance"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(value: Equipment['status']) =>
                                                    setFormData({ ...formData, status: value })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="manufacturer">Manufacturer</Label>
                                            <Input
                                                id="manufacturer"
                                                value={formData.manufacturer}
                                                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="model">Model</Label>
                                            <Input
                                                id="model"
                                                value={formData.model}
                                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="serial_number">Serial Number</Label>
                                            <Input
                                                id="serial_number"
                                                value={formData.serial_number}
                                                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="location">Location</Label>
                                            <Input
                                                id="location"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                placeholder="e.g., Lab A, Bench 3"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">Add Equipment</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    }
                />

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Equipment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{equipment.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {equipment.filter(e => e.status === 'active').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-red-600/50 bg-red-900/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Calibration Due
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{calibrationDue.length}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Equipment Registry</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Last Calibrated</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                                    </TableRow>
                                ) : equipment.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No equipment registered
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    equipment.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono text-sm">{item.code}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Wrench className="w-4 h-4 text-muted-foreground" />
                                                    <div>
                                                        <div className="font-medium">{item.name}</div>
                                                        {item.manufacturer && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {item.manufacturer} {item.model}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{item.type}</TableCell>
                                            <TableCell>{item.location || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                                    {formatDate(item.last_calibrated)}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(item.status)}</TableCell>
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
