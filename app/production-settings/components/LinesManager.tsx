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
import { ProductionLine, getProductionLines, createProductionLine, updateProductionLine, deleteProductionLine } from "@/lib/queries/production-settings";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LinesManager() {
    const [lines, setLines] = useState<ProductionLine[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingLine, setEditingLine] = useState<ProductionLine | null>(null);
    const [formData, setFormData] = useState<Partial<ProductionLine>>({
        name: "",
        code: "",
        status: "active",
        capacity_per_hour: 0
    });

    useEffect(() => {
        loadLines();
    }, []);

    const loadLines = async () => {
        setLoading(true);
        try {
            const { data, error } = await getProductionLines();
            if (error) throw error;
            setLines(data || []);
        } catch (error) {
            console.error("Error loading lines:", error);
            toast.error("Failed to load production lines");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingLine(null);
        setFormData({ name: "", code: "", status: "active", capacity_per_hour: 0 });
        setShowDialog(true);
    };

    const handleEdit = (line: ProductionLine) => {
        setEditingLine(line);
        setFormData({
            name: line.name,
            code: line.code,
            status: line.status,
            capacity_per_hour: line.capacity_per_hour || 0
        });
        setShowDialog(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this line?")) return;

        try {
            const { error } = await deleteProductionLine(id);
            if (error) throw error;
            toast.success("Line deleted successfully");
            loadLines();
        } catch (error) {
            console.error("Error deleting line:", error);
            toast.error("Failed to delete line");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingLine) {
                const { error } = await updateProductionLine(editingLine.id, formData);
                if (error) throw error;
                toast.success("Line updated successfully");
            } else {
                const { error } = await createProductionLine(formData);
                if (error) throw error;
                toast.success("Line created successfully");
            }
            setShowDialog(false);
            loadLines();
        } catch (error) {
            console.error("Error saving line:", error);
            toast.error("Failed to save line");
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Production Lines</h3>
                <Button onClick={handleCreate} size="sm">
                    <Plus className="mr-2 h-4 w-4" /> New Line
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Capacity/Hr</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lines.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No production lines found
                                </TableCell>
                            </TableRow>
                        ) : (
                            lines.map((line) => (
                                <TableRow key={line.id}>
                                    <TableCell className="font-medium">{line.name}</TableCell>
                                    <TableCell>{line.code}</TableCell>
                                    <TableCell>
                                        <Badge variant={line.status === 'active' ? 'default' : 'secondary'}>
                                            {line.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{line.capacity_per_hour?.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(line)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(line.id)}>
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
                        <DialogTitle>{editingLine ? "Edit Line" : "New Production Line"}</DialogTitle>
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
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Capacity / Hour</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    value={formData.capacity_per_hour}
                                    onChange={(e) => setFormData({ ...formData, capacity_per_hour: Number(e.target.value) })}
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
