"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Shift, getShifts, createShift, updateShift, deleteShift } from "@/lib/queries/production-settings";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export function ShiftsManager() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [formData, setFormData] = useState<Partial<Shift>>({
        name: "",
        code: "",
        start_time: "08:00",
        end_time: "17:00",
        active: true
    });

    useEffect(() => {
        loadShifts();
    }, []);

    const loadShifts = async () => {
        setLoading(true);
        try {
            const { data, error } = await getShifts();
            if (error) throw error;
            setShifts(data || []);
        } catch (error) {
            console.error("Error loading shifts:", error);
            toast.error("Failed to load shifts");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingShift(null);
        setFormData({ name: "", code: "", start_time: "08:00", end_time: "17:00", active: true });
        setShowDialog(true);
    };

    const handleEdit = (shift: Shift) => {
        setEditingShift(shift);
        setFormData({
            name: shift.name,
            code: shift.code || "",
            start_time: shift.start_time,
            end_time: shift.end_time,
            active: shift.active
        });
        setShowDialog(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this shift?")) return;

        try {
            const { error } = await deleteShift(id);
            if (error) throw error;
            toast.success("Shift deleted successfully");
            loadShifts();
        } catch (error) {
            console.error("Error deleting shift:", error);
            toast.error("Failed to delete shift");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingShift) {
                const { error } = await updateShift(editingShift.id, formData);
                if (error) throw error;
                toast.success("Shift updated successfully");
            } else {
                const { error } = await createShift(formData);
                if (error) throw error;
                toast.success("Shift created successfully");
            }
            setShowDialog(false);
            loadShifts();
        } catch (error) {
            console.error("Error saving shift:", error);
            toast.error("Failed to save shift");
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Work Shifts</h3>
                <Button onClick={handleCreate} size="sm">
                    <Plus className="mr-2 h-4 w-4" /> New Shift
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Schedule</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shifts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No shifts found
                                </TableCell>
                            </TableRow>
                        ) : (
                            shifts.map((shift) => (
                                <TableRow key={shift.id}>
                                    <TableCell className="font-medium">{shift.name}</TableCell>
                                    <TableCell>{shift.code || "-"}</TableCell>
                                    <TableCell>{shift.start_time} - {shift.end_time}</TableCell>
                                    <TableCell>
                                        <Badge variant={shift.active ? 'default' : 'secondary'}>
                                            {shift.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(shift)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(shift.id)}>
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
                        <DialogTitle>{editingShift ? "Edit Shift" : "New Shift"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Shift Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g. Morning Shift"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Code</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g. A"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start">Start Time</Label>
                                <Input
                                    id="start"
                                    type="time"
                                    value={formData.start_time}
                                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end">End Time</Label>
                                <Input
                                    id="end"
                                    type="time"
                                    value={formData.end_time}
                                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="active"
                                checked={!!formData.active}
                                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                            />
                            <Label htmlFor="active">Active Shift</Label>
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
