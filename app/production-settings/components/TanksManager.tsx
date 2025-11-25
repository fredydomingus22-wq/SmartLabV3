"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MixingTank, getMixingTanks, createMixingTank, updateMixingTank, deleteMixingTank } from "@/lib/queries/production-settings";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function TanksManager() {
    const [tanks, setTanks] = useState<MixingTank[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingTank, setEditingTank] = useState<MixingTank | null>(null);
    const [formData, setFormData] = useState<Partial<MixingTank>>({
        name: "",
        code: "",
        status: "active",
        capacity: 0
    });

    useEffect(() => {
        loadTanks();
    }, []);

    const loadTanks = async () => {
        setLoading(true);
        try {
            const { data, error } = await getMixingTanks();
            if (error) throw error;
            setTanks(data || []);
        } catch (error) {
            console.error("Error loading tanks:", error);
            toast.error("Failed to load mixing tanks");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingTank(null);
        setFormData({ name: "", code: "", status: "active", capacity: 0 });
        setShowDialog(true);
    };

    const handleEdit = (tank: MixingTank) => {
        setEditingTank(tank);
        setFormData({
            name: tank.name,
            code: tank.code,
            status: tank.status,
            capacity: tank.capacity || 0
        });
        setShowDialog(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this tank?")) return;

        try {
            const { error } = await deleteMixingTank(id);
            if (error) throw error;
            toast.success("Tank deleted successfully");
            loadTanks();
        } catch (error) {
            console.error("Error deleting tank:", error);
            toast.error("Failed to delete tank");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTank) {
                const { error } = await updateMixingTank(editingTank.id, formData);
                if (error) throw error;
                toast.success("Tank updated successfully");
            } else {
                const { error } = await createMixingTank(formData);
                if (error) throw error;
                toast.success("Tank created successfully");
            }
            setShowDialog(false);
            loadTanks();
        } catch (error) {
            console.error("Error saving tank:", error);
            toast.error("Failed to save tank");
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Mixing Tanks</h3>
                <Button onClick={handleCreate} size="sm">
                    <Plus className="mr-2 h-4 w-4" /> New Tank
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Capacity (L)</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tanks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No mixing tanks found
                                </TableCell>
                            </TableRow>
                        ) : (
                            tanks.map((tank) => (
                                <TableRow key={tank.id}>
                                    <TableCell className="font-medium">{tank.name}</TableCell>
                                    <TableCell>{tank.code}</TableCell>
                                    <TableCell>
                                        <Badge variant={tank.status === 'active' ? 'default' : 'secondary'}>
                                            {tank.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{tank.capacity?.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(tank)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(tank.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTank ? "Edit Tank" : "New Mixing Tank"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Code</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="cleaning">Cleaning</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Capacity (Liters)</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
