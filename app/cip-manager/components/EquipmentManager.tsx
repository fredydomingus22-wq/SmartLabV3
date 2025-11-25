"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getEquipment, createEquipment, updateEquipment, deleteEquipment } from "@/lib/queries/cip";
import { Equipment } from "@/lib/queries/cip";

export function EquipmentManager() {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editing, setEditing] = useState<Equipment | null>(null);
    const [formData, setFormData] = useState<Partial<Equipment>>({
        name: "",
        code: "",
        status: "active",
    });

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setLoading(true);
        try {
            const { data, error } = await getEquipment();
            if (error) throw error;
            setEquipment(data || []);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load equipment");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditing(null);
        setFormData({ name: "", code: "", status: "active" });
        setShowDialog(true);
    };

    const handleEdit = (eq: Equipment) => {
        setEditing(eq);
        setFormData({
            name: eq.name,
            code: eq.code,
            type: eq.type,
            status: eq.status,
        });
        setShowDialog(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete equipment?")) return;
        try {
            const { error } = await deleteEquipment(id);
            if (error) throw error;
            toast.success("Equipment deleted");
            load();
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                const { error } = await updateEquipment(editing.id, formData);
                if (error) throw error;
                toast.success("Equipment updated");
            } else {
                const { error } = await createEquipment(formData);
                if (error) throw error;
                toast.success("Equipment created");
            }
            setShowDialog(false);
            load();
        } catch (e) {
            console.error(e);
            toast.error("Failed to save equipment");
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Equipment</h3>
                <Button onClick={handleCreate} size="sm">
                    <Plus className="mr-2 h-4 w-4" /> New Equipment
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {equipment.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No equipment found</TableCell>
                            </TableRow>
                        ) : (
                            equipment.map(eq => (
                                <TableRow key={eq.id}>
                                    <TableCell>{eq.name}</TableCell>
                                    <TableCell>{eq.code}</TableCell>
                                    <TableCell>{eq.type || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={eq.status === 'active' ? 'default' : 'secondary'}>{eq.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(eq)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(eq.id)}>
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
                        <DialogTitle>{editing ? "Edit Equipment" : "New Equipment"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={formData.name || ""} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Code</Label>
                            <Input id="code" value={formData.code || ""} onChange={e => setFormData({ ...formData, code: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Input id="type" value={formData.type || ""} onChange={e => setFormData({ ...formData, type: e.target.value })} placeholder="e.g. Mixer" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status || "active"} onValueChange={v => setFormData({ ...formData, status: v as any })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
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
